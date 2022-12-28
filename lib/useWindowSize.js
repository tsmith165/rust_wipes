import { useState, useEffect } from 'react';

export default function useWindowSize() {
    // Initialize state with undefined width/height so server and client renders match
    // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
    const [windowSize, setWindowSize] = useState({
      width: undefined,
      height: undefined,
    });
  
    useEffect(() => {
      // only execute all the code below in client side
      if (typeof window !== 'undefined') {
        // Handler to call on window resize
        function handle_resize() {
          // Set window width/height to state
          setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        }
      
        // Add event listener
        window.addEventListener("resize", handle_resize);
       
        // Call handler right away so state gets updated with initial window size
        handle_resize();
      
        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handle_resize);
      }
    }, []); // Empty array ensures that effect is only run on mount
    return windowSize;
}