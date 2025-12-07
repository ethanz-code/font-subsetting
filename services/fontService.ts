import { FontMetadata, ProcessedResult } from '../types';

export const parseFontFile = async (
  file: File, 
  onProgress?: (percent: number) => void
): Promise<FontMetadata> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    reader.onload = (e) => {
      // Small delay to ensure 100% shows briefly
      setTimeout(() => {
        const buffer = e.target?.result as ArrayBuffer;
        try {
          const font = window.opentype.parse(buffer);
          const englishName = font.names.fontFamily?.en || font.names.fontFamily?.[Object.keys(font.names.fontFamily)[0]];
          const style = font.names.fontSubfamily?.en || "Regular";

          resolve({
            fileName: file.name,
            fontName: englishName || file.name.split('.')[0],
            familyName: englishName || "Unknown",
            styleName: style,
            unitsPerEm: font.unitsPerEm,
            glyphCount: font.numGlyphs,
            buffer: buffer,
            originalSize: file.size,
          });
        } catch (err) {
          reject(new Error("Invalid font file. Please upload a TTF, OTF, or WOFF."));
        }
      }, 200);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const loadFontFromUrl = async (
  url: string,
  onProgress?: (percent: number) => void
): Promise<FontMetadata> => {
  let targetUrl = url;
  
  // Simple check if it's a Google Fonts CSS URL
  if (url.includes('fonts.googleapis.com/css')) {
    try {
      // Use AllOrigins as a CORS proxy for the CSS
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const cssResponse = await fetch(proxyUrl);
      if (!cssResponse.ok) throw new Error("Failed to fetch Google Fonts CSS");
      
      const cssText = await cssResponse.text();
      // Regex to find the first src: url(...)
      const match = cssText.match(/src:\s*url\(([^)]+)\)/);
      if (match && match[1]) {
        targetUrl = match[1].replace(/['"]/g, ''); // Clean up quotes
      } else {
        throw new Error("Could not find font URL in the provided CSS.");
      }
    } catch (e) {
      console.error(e);
      throw new Error("Failed to parse Google Fonts URL. Please try a direct file link.");
    }
  }

  // Fetch the actual font file (Gstatic usually supports CORS, other direct links might fail)
  try {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`Failed to fetch font: ${response.statusText}`);
    
    const contentLength = response.headers.get('Content-Length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    let loaded = 0;
    const reader = response.body?.getReader();
    const chunks = [];

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (total > 0 && onProgress) {
          onProgress(Math.round((loaded / total) * 100));
        } else if (onProgress) {
          // If no content length, fake progress or just update periodically
          // Cap at 90% for indeterminate
          onProgress(Math.min(90, Math.round((loaded / (1024 * 1024 * 2)) * 100))); 
        }
      }
    }

    // Combine chunks
    const buffer = new Uint8Array(loaded);
    let position = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, position);
      position += chunk.length;
    }
    
    const arrayBuffer = buffer.buffer;

    // Parse it
    const font = window.opentype.parse(arrayBuffer);
    const englishName = font.names.fontFamily?.en || "ImportedFont";
    const style = font.names.fontSubfamily?.en || "Regular";

    // Infer filename from URL or default
    const urlFileName = targetUrl.split('/').pop()?.split('?')[0] || "imported.ttf";

    return {
      fileName: urlFileName,
      fontName: englishName,
      familyName: englishName,
      styleName: style,
      unitsPerEm: font.unitsPerEm,
      glyphCount: font.numGlyphs,
      buffer: arrayBuffer,
      originalSize: arrayBuffer.byteLength,
    };

  } catch (err) {
    console.error(err);
    throw new Error("Failed to load font file. Possible CORS issue or invalid URL.");
  }
};

/**
 * Creates a subset font and packs it into a Zip file with CSS.
 * Note: Browser-side subsetting with opentype.js is limited. 
 * We will create a new font object with only the requested glyphs.
 */
export const generateSubset = async (
  metadata: FontMetadata, 
  characters: string, 
  customFamilyName: string
): Promise<ProcessedResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      const font = window.opentype.parse(metadata.buffer);
      
      // 1. Identify Glyphs
      // Always include space and .notdef
      const distinctChars = Array.from(new Set(characters.split('')));
      const glyphs = [font.glyphs.get(0)]; // .notdef
      
      distinctChars.forEach(char => {
        const glyph = font.charToGlyph(char);
        if (glyph) {
          glyphs.push(glyph);
        }
      });

      // 2. Create new Font Object (Subset)
      const subsetFont = new window.opentype.Font({
        familyName: customFamilyName || metadata.familyName,
        styleName: metadata.styleName,
        unitsPerEm: font.unitsPerEm,
        ascender: font.ascender,
        descender: font.descender,
        glyphs: glyphs
      });

      // 3. Convert to ArrayBuffer
      const subsetBuffer = subsetFont.toArrayBuffer();
      const subsetBlob = new Blob([subsetBuffer], { type: 'font/ttf' }); // Export as TTF for compatibility

      // 4. Create Zip
      const zip = new window.JSZip();
      const cleanFileName = (customFamilyName || metadata.familyName).toLowerCase().replace(/\s+/g, '-');
      
      zip.file(`${cleanFileName}-subset.ttf`, subsetBlob);
      
      // 5. Generate CSS
      const cssContent = `/* Generated by FontForge */
@font-face {
  font-family: '${customFamilyName || metadata.familyName}';
  src: url('./${cleanFileName}-subset.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

body {
  font-family: '${customFamilyName || metadata.familyName}', sans-serif;
}
`;
      zip.file('fonts.css', cssContent);

      // 6. Generate Demo HTML
      const demoHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet" href="fonts.css">
<style>
  body { padding: 40px; font-size: 24px; line-height: 1.5; color: #333; }
  h1 { font-weight: normal; margin-bottom: 20px; }
  .preview { border: 1px solid #eee; padding: 20px; background: #fafafa; border-radius: 8px; word-break: break-all; }
</style>
</head>
<body>
  <h1>Font Subset Demo</h1>
  <p class="preview">${characters.substring(0, 100)}${characters.length > 100 ? '...' : ''}</p>
  <p><small>Only the characters above are included in this font file.</small></p>
</body>
</html>`;
      zip.file('demo.html', demoHtml);

      const zipContent = await zip.generateAsync({ type: 'blob' });

      resolve({
        zipBlob: zipContent,
        cssSnippet: cssContent,
        subsetSize: subsetBlob.size,
        savings: 1 - (subsetBlob.size / metadata.originalSize)
      });

    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
};
