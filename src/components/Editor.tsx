import React, { useEffect } from "react";
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import '../assets/editor.css'
import '../assets/prism.css'
import Prism from "prismjs"

interface EditorProps {
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}


const Editor = ({value, onChange} : EditorProps) => {

    const lines = (value.split(/\r\n|\r|\n/)||[]).length

        
    const gutterRef = React.useRef<HTMLDivElement>(null)
    const editorRef = React.useRef<HTMLTextAreaElement>(null)
    const codeBlockRef = React.useRef<HTMLTextAreaElement>(null)

    const lineNumbers = [...Array(lines)].map(
        (_, i) => (
            <div key = {i}>
            {i + 1}<br/>
            </div>
        )
    )

    useEffect(() => {
        if (editorRef!.current) {
            Prism.highlightAll()
        }
    })

    // Set the gutter scroll position to the editor position
    const textAreaScroll = (e: React.UIEvent<HTMLElement>): void => {
        if (gutterRef.current! && editorRef.current!) {
            editorRef.current.focus()
            gutterRef.current.focus()
            gutterRef.current.scrollTop = editorRef.current.scrollTop
        }
    }

    const update = (text: string): void => {
        if (editorRef.current && codeBlockRef.current) {
            editorRef.current.focus()
            editorRef.current.innerText = text
            codeBlockRef.current.innerText = text

            window.Prism = window.Prism || {};
            console.log("highlighting")
            console.log(editorRef.current.value)
            Prism.highlight(editorRef.current.value, Prism.languages.javascript, "javascript")
        }
    }

    
    return (
        <ScrollSync>
        <div className="editor-container"> 
            
                <ScrollSyncPane>
                    <div className="editor-gutter-container padding">
                        <div 
                            className="editor-gutter scroll-text-style"
                            ref={gutterRef as React.RefObject<HTMLDivElement>}
                        >
                            {lineNumbers}
                        </div>
                    </div>
                </ScrollSyncPane>
                <ScrollSyncPane>
                    
                    <div className="editor scroll-text-style padding">
                    <ScrollSyncPane>
                        <textarea
                            onChange={onChange}
                            onInput={() => update(value)}
                            onScroll={textAreaScroll}
                            spellCheck="false"
                            ref={editorRef as React.RefObject<HTMLTextAreaElement>}
                            value={value}
                        />
                        </ScrollSyncPane>
                        <ScrollSyncPane>
                        <pre className="language-javascript scroll-text-style">
                            <code 
                                
                                ref={codeBlockRef as React.RefObject<HTMLTextAreaElement>}
                            >{value}</code>
                        </pre>
                        </ScrollSyncPane>
                    </div>
                </ScrollSyncPane>
           
        </div>
        </ScrollSync>
    )
}

export default Editor