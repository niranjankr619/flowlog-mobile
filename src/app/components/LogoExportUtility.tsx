import React from 'react';
import { Download } from 'lucide-react';
import { Button } from './ui/button';

export default function LogoExportUtility() {
  const downloadSVG = (filename: string, svgPath: string) => {
    const link = document.createElement('a');
    link.href = svgPath;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToPNG = (svgPath: string, filename: string, size: number) => {
    fetch(svgPath)
      .then(response => response.text())
      .then(svgText => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        canvas.width = size;
        canvas.height = size;
        
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        img.onload = () => {
          // Fill with dark background for better visibility
          if (ctx) {
            ctx.fillStyle = '#0F1117';
            ctx.fillRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
          }
          
          canvas.toBlob((blob) => {
            if (blob) {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }, 'image/png');
          
          URL.revokeObjectURL(url);
        };
        
        img.src = url;
      });
  };

  const logos = [
    {
      title: 'Icon Only',
      path: '/flowlog-icon.svg',
      description: '256x256px circular icon',
      preview: '/flowlog-icon.svg'
    },
    {
      title: 'Wordmark',
      path: '/flowlog-wordmark.svg',
      description: 'Text only logo',
      preview: '/flowlog-wordmark.svg'
    },
    {
      title: 'Full Logo',
      path: '/flowlog-full.svg',
      description: 'Icon + wordmark combo',
      preview: '/flowlog-full.svg'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F1117] px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-white mb-2">FLOWLOG Logo Assets</h1>
          <p className="text-gray-400">
            Download SVG files or convert to PNG in various sizes
          </p>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {logos.map((logo) => (
            <div
              key={logo.path}
              className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
            >
              {/* Preview */}
              <div className="bg-[#0F1117] rounded-2xl p-8 mb-6 flex items-center justify-center min-h-[200px]">
                <img
                  src={logo.preview}
                  alt={logo.title}
                  className="max-w-full max-h-[160px]"
                />
              </div>

              {/* Info */}
              <h3 className="text-white mb-1">{logo.title}</h3>
              <p className="text-gray-400 text-sm mb-6">{logo.description}</p>

              {/* Download Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => downloadSVG(`flowlog-${logo.title.toLowerCase().replace(' ', '-')}.svg`, logo.path)}
                  className="w-full bg-indigo/10 hover:bg-indigo/20 text-indigo border border-indigo/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download SVG
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => convertToPNG(logo.path, `flowlog-${logo.title.toLowerCase().replace(' ', '-')}-512.png`, 512)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    PNG 512px
                  </Button>
                  <Button
                    onClick={() => convertToPNG(logo.path, `flowlog-${logo.title.toLowerCase().replace(' ', '-')}-1024.png`, 1024)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    PNG 1024px
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          <h2 className="text-white mb-4">Export Instructions</h2>
          <div className="space-y-4 text-gray-400">
            <div>
              <h4 className="text-white mb-2">SVG Files (Recommended)</h4>
              <p className="text-sm">
                Vector files that scale perfectly at any size. Use these for web, print, and anywhere you need crisp logos.
              </p>
            </div>
            
            <div>
              <h4 className="text-white mb-2">PNG Export</h4>
              <p className="text-sm">
                Click PNG buttons to convert SVG to PNG at different sizes. Common sizes:
              </p>
              <ul className="text-sm mt-2 ml-4 space-y-1">
                <li>• 512px - Standard app icons, social media</li>
                <li>• 1024px - High-res displays, print materials</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white mb-2">Color Specifications</h4>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Primary Indigo: <code className="bg-white/10 px-2 py-1 rounded">#4B5CFB</code></li>
                <li>• Secondary Aqua: <code className="bg-white/10 px-2 py-1 rounded">#00C7B7</code></li>
                <li>• Font: Urbanist Bold 700</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
