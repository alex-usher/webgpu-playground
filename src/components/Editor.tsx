import React, { useEffect } from "react";
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
    const codeBlockRef = React.useRef<HTMLPreElement>(null)

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

    // Ensure editor scroll positions are the same, set gutter scroll to the editor scroll
    const textAreaScroll = (e: React.UIEvent<HTMLElement>): void => {
        if (gutterRef.current && editorRef.current && codeBlockRef.current) {
            codeBlockRef.current.focus()
            editorRef.current.focus()
            gutterRef.current.focus()
            gutterRef.current.scrollTop = editorRef.current.scrollTop
            codeBlockRef.current.scrollTop = editorRef.current.scrollTop
            codeBlockRef.current.scrollLeft = editorRef.current.scrollLeft
        }
    }

    // Ensure editor scroll positions are the same, set gutter scroll to the editor scroll
    const codeBlockScroll = (e: React.UIEvent<HTMLElement>): void => {
        if (gutterRef.current && editorRef.current && codeBlockRef.current) {
            codeBlockRef.current.focus()
            editorRef.current.focus()
            gutterRef.current.focus()
            gutterRef.current.scrollTop = codeBlockRef.current.scrollTop
            editorRef.current.scrollTop = codeBlockRef.current.scrollTop
            editorRef.current.scrollLeft = codeBlockRef.current.scrollLeft
        }
    }

    // Set the editor scroll positions to the gutter positions
    const gutterScroll = (e: React.UIEvent<HTMLElement>): void => {
        if (gutterRef.current && editorRef.current && codeBlockRef.current) {
            codeBlockRef.current.focus()
            editorRef.current.focus()
            gutterRef.current.focus()
            editorRef.current.scrollTop = gutterRef.current.scrollTop
            codeBlockRef.current.scrollTop = gutterRef.current.scrollTop
        }
    }

    // Update the textarea and code text values, re-highlight the text in the code block
    const update = (text: string): void => {
        if (editorRef.current && codeBlockRef.current) {
            editorRef.current.focus()
            editorRef.current.innerText = text
            codeBlockRef.current.innerText = text

            window.Prism = window.Prism || {};
            Prism.highlight(editorRef.current.value, Prism.languages.javascript, "javascript")
        }
    }

    
    return (
        <div className="editor-container"> 
            {/* line numbers */}
            <div className="editor-gutter-container padding" onScroll={gutterScroll}>
                <div 
                    className="editor-gutter scroll-text-style"
                    ref={gutterRef as React.RefObject<HTMLDivElement>}
                >
                    {lineNumbers}
                </div>
            </div>

            {/* code area */}
            <div className="editor scroll-text-style">
                <div className="heightDiv">
                    <textarea
                        className="code-text-editor padding"
                        onChange={onChange}
                        onInput={() => update(value)}
                        onScroll={textAreaScroll}
                        spellCheck="false"
                        ref={editorRef as React.RefObject<HTMLTextAreaElement>}
                        value={value}
                    />
                </div>
                <pre className="language-javascript scroll-text-style padding">
                    <code 
                        className="padding"
                        onScroll={codeBlockScroll}
                        ref={codeBlockRef as React.RefObject<HTMLPreElement>}
                    >
                        {value}
                    </code>
                </pre>
            </div>
           
        </div>
    )
}

export default Editor