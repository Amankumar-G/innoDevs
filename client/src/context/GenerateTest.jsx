import React, { createContext, useState, useContext } from "react";

const GenerateContext = createContext();

export function GenerateProvider({ children }) {
    const [isGenerating, setIsGenerating] = useState(false);

    return (
        <GenerateContext.Provider value={{ isGenerating, setIsGenerating }}>
            {children}
        </GenerateContext.Provider>
    );
}

export function useGenerate() {
    return useContext(GenerateContext);
}


