// lib/mermaid-config.ts
import mermaid from 'mermaid';
import zenuml from '@mermaid-js/mermaid-zenuml';

export const initMermaid = async () => {
    try {
        // In Mermaid v11, ZenUML is registered via registerExternalDiagrams
        // The default export from @mermaid-js/mermaid-zenuml is the diagram definition
        await mermaid.registerExternalDiagrams([zenuml]);
        
        mermaid.initialize({
            startOnLoad: false,
            theme: 'neutral', // Matches your AI1.mmd 
            securityLevel: 'loose', // Necessary to render the HTML labels
            flowchart: {
                htmlLabels: true,
                curve: 'basis',
            },
            // @ts-ignore - look property is valid in v11 but might not be in all type versions
            look: 'handDrawn'
        });
    } catch (err) {
        console.error("Failed to initialize Mermaid or ZenUML:", err);
    }
};