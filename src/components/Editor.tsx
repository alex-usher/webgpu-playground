import React, {useEffect, useState} from "react";
import {ScrollSync, ScrollSyncPane} from 'react-scroll-sync';
import '../assets/editor.css'
import Prism from "prismjs"

interface EditorProps {
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    setValue: (value: string) => void
}


const Editor = ({value, onChange, setValue}: EditorProps) => {
    const lines = (value.split(/\r\n|\r|\n/) || []).length


    const gutterRef = React.useRef<HTMLDivElement>(null)
    const editorRef = React.useRef<HTMLTextAreaElement>(null)

    const [selectionStart, setSelectionStart] = useState(0)
    const [selectionEnd, setSelectionEnd] = useState(0)

    useEffect(() => {
        editorRef.current!.selectionStart = selectionStart
        editorRef.current!.selectionEnd = selectionEnd
    }, [editorRef, selectionStart, selectionEnd])

    const lineNumbers = [...Array(lines)].map(
        (_, i) => (
            <div key={i}>
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

    const update = (text: string): void => {
        if (editorRef.current) {
            editorRef.current.focus()
            editorRef.current.innerText = text

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
                    <script src="prism.js" data-manual></script>
                    <textarea
                        className="editor scroll-text-style"
                        onChange={(e) => {
                            setValue(e.target.value)
                            setSelectionStart(e.target.selectionStart)
                            setSelectionEnd(e.target.selectionEnd)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Tab") {
                                e.preventDefault()
                                const newValue = `${value.substring(0, editorRef.current!.selectionStart)}    ${value.substring(editorRef.current!.selectionEnd)}`
                                editorRef.current!.selectionStart = editorRef.current!.selectionEnd = editorRef.current!.selectionStart + 1
                                setValue(newValue)
                                setSelectionStart(selectionStart + 4)
                                setSelectionEnd(selectionStart + 4)
                                update(newValue)
                            }
                        }}
                        onClick={() => {
                            setSelectionStart(editorRef.current!.selectionStart)
                            setSelectionEnd(editorRef.current!.selectionEnd)
                        }}
                        onInput={() => update(value)}
                        onScroll={textAreaScroll}
                        spellCheck="false"
                        ref={editorRef as React.RefObject<HTMLTextAreaElement>}
                        value={value}
                    />
                </ScrollSyncPane>

            </div>
        </ScrollSync>
    )
}

export default Editor