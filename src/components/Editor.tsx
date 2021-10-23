import React from "react";
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import '../assets/editor.css'

interface EditorProps {
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}


const Editor = ({value, onChange} : EditorProps) => {
    
    const lines = (value.split(/\r\n|\r|\n/)||[]).length

        
    const gutterRef = React.useRef<HTMLDivElement>(null)
    const editorRef = React.useRef<HTMLTextAreaElement>(null)


    const lineNumbers = [...Array(lines)].map(
        (_, i) => (
            <div key = {i}>
            {i + 1}<br/>
            </div>
        )
    )

    // Set the gutter scroll position to the editor position
    const textAreaScroll = (e: React.UIEvent<HTMLElement>): void => {
        if (gutterRef.current! && editorRef.current!) {
            editorRef.current.focus()
            gutterRef.current.focus()
            gutterRef.current.scrollTop = editorRef.current.scrollTop
        }
    }

    
    return (
        <ScrollSync>
        <div className="editor-container"> 
            
                <ScrollSyncPane>
                    <div className="editor-gutter-container">
                        <div 
                            className="editor-gutter scroll-text-style"
                            ref={gutterRef as React.RefObject<HTMLDivElement>}
                        >
                            {lineNumbers}
                        </div>
                    </div>
                </ScrollSyncPane>
                <ScrollSyncPane>
                    <textarea 
                        className="editor scroll-text-style" 
                        value={value} 
                        onChange={onChange}  
                        onScroll={textAreaScroll}
                        spellCheck="false"
                        ref={editorRef as React.RefObject<HTMLTextAreaElement>}
                    />
                </ScrollSyncPane>
           
        </div>
        </ScrollSync>
    )
}

export default Editor