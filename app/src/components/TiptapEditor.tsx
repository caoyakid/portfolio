'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function TiptapEditor({ content, onChange, placeholder = '開始撰寫…' }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'tiptap-content prose',
        'data-placeholder': placeholder,
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  const ToolbarBtn = ({
    onClick,
    active,
    title,
    children,
    id,
  }: {
    onClick: () => void
    active?: boolean
    title: string
    children: React.ReactNode
    id: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`tiptap-toolbar-btn ${active ? 'is-active' : ''}`}
      title={title}
      id={id}
    >
      {children}
    </button>
  )

  return (
    <div className="tiptap-editor">
      <div className="tiptap-toolbar">
        <ToolbarBtn
          id="toolbar-bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >B</ToolbarBtn>
        <ToolbarBtn
          id="toolbar-italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        ><em>I</em></ToolbarBtn>
        <ToolbarBtn
          id="toolbar-strike"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        ><s>S</s></ToolbarBtn>

        <div style={{ width: 1, background: 'var(--color-border)', margin: '4px 4px' }} />

        <ToolbarBtn
          id="toolbar-h2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >H2</ToolbarBtn>
        <ToolbarBtn
          id="toolbar-h3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >H3</ToolbarBtn>

        <div style={{ width: 1, background: 'var(--color-border)', margin: '4px 4px' }} />

        <ToolbarBtn
          id="toolbar-ul"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >• List</ToolbarBtn>
        <ToolbarBtn
          id="toolbar-ol"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Ordered list"
        >1. List</ToolbarBtn>
        <ToolbarBtn
          id="toolbar-quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >❝</ToolbarBtn>

        <div style={{ width: 1, background: 'var(--color-border)', margin: '4px 4px' }} />

        <ToolbarBtn
          id="toolbar-link"
          onClick={() => {
            const url = window.prompt('URL')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
          active={editor.isActive('link')}
          title="Link"
        >🔗</ToolbarBtn>
        <ToolbarBtn
          id="toolbar-image"
          onClick={() => {
            const url = window.prompt('Image URL')
            if (url) editor.chain().focus().setImage({ src: url }).run()
          }}
          active={false}
          title="Image"
        >🖼</ToolbarBtn>

        <div style={{ width: 1, background: 'var(--color-border)', margin: '4px 4px' }} />

        <ToolbarBtn
          id="toolbar-undo"
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
          title="Undo"
        >↩</ToolbarBtn>
        <ToolbarBtn
          id="toolbar-redo"
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
          title="Redo"
        >↪</ToolbarBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
