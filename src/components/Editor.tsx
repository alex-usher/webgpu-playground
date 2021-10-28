import React, { useEffect } from "react";
// import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
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
    // const preRef = React.useRef<HTMLTextAreaElement>(null)

    const lineNumbers = [...Array(lines)].map(
        (_, i) => (
            <div key = {i}>
            {i + 1}<br/>
            </div>
        )
    )

    // lineNumbers.push(<div key = {lines}><br/></div>)

    useEffect(() => {
        if (editorRef!.current) {
            // console.log(lines)
            // console.log(lineNumbers.length)
            Prism.highlightAll()
        }
    })




    // Set the gutter scroll position to the editor position
    const textAreaScroll = (e: React.UIEvent<HTMLElement>): void => {
        console.log("scrolling textarea")
        if (gutterRef.current && editorRef.current && codeBlockRef.current) {
            codeBlockRef.current.focus()
            editorRef.current.focus()
            gutterRef.current.focus()
            gutterRef.current.scrollTop = editorRef.current.scrollTop
            codeBlockRef.current.scrollTop = editorRef.current.scrollTop
            codeBlockRef.current.scrollLeft = editorRef.current.scrollLeft

        }
    }

    // Set the gutter scroll position to the editor position
    const codeBlockScroll = (e: React.UIEvent<HTMLElement>): void => {
        console.log("scrolling code")
        if (gutterRef.current && editorRef.current && codeBlockRef.current) {
            codeBlockRef.current.focus()
            editorRef.current.focus()
            gutterRef.current.focus()
            gutterRef.current.scrollTop = codeBlockRef.current.scrollTop
            editorRef.current.scrollTop = codeBlockRef.current.scrollTop
            editorRef.current.scrollLeft = codeBlockRef.current.scrollLeft
            console.log((codeBlockRef.current.innerText.split(/\r\n|\r|\n/)||[]).length)
            console.log((editorRef.current.value.split(/\r\n|\r|\n/)||[]).length)
            console.log(lineNumbers.length)
            // console.log(editorRef.current.innerText)
            // console.log(gutterRef.current.innerText)
            // console.log(codeBlockRef.current.scrollTop)
            // console.log(gutterRef.current.scrollTop)
        }
    }

    // Set the gutter scroll position to the editor position
    const gutterScroll = (e: React.UIEvent<HTMLElement>): void => {
        if (gutterRef.current && editorRef.current && codeBlockRef.current) {
            codeBlockRef.current.focus()
            editorRef.current.focus()
            gutterRef.current.focus()
            editorRef.current.scrollTop = gutterRef.current.scrollTop
            codeBlockRef.current.scrollTop = gutterRef.current.scrollTop
            // console.log(codeBlockRef.current.scrollTop)
            // console.log(gutterRef.current.scrollTop)
        }
    }

    const update = (text: string): void => {
        if (editorRef.current && codeBlockRef.current) {
            editorRef.current.focus()
            editorRef.current.innerText = text
            codeBlockRef.current.innerText = text

            window.Prism = window.Prism || {};
            // console.log("highlighting")
            // console.log(editorRef.current.value)
            Prism.highlight(editorRef.current.value, Prism.languages.javascript, "javascript")
        }
    }

    
    return (
        <div className="editor-container"> 
    
            <div 
                className="editor-gutter-container padding" 
                onScroll={gutterScroll}
                // ref={gutterRef as React.RefObject<HTMLDivElement>}
            >
                <div 
                    className="editor-gutter scroll-text-style"
                    ref={gutterRef as React.RefObject<HTMLDivElement>}
                >
                    {lineNumbers}
                </div>
            </div>

            
            <div
                className="editor scroll-text-style"
            >
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
                <pre 
                    className="language-javascript scroll-text-style padding"
                >
                    <code 
                    className="padding"
                    onScroll={codeBlockScroll}
                    ref={codeBlockRef as React.RefObject<HTMLPreElement>}
                   >{value}</code>
                </pre>
            </div>
           
        </div>
    )
}

export default Editor