import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'

interface MessageContentProps {
  content: string
}

export function MessageContent({ content }: MessageContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // Custom component handling for better styling
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const isInline = !match && !className
          
          if (isInline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }
          
          return (
            <pre>
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          )
        },
        // Ensure tables render properly
        table({ children }) {
          return (
            <div className="table-wrapper">
              <table>{children}</table>
            </div>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

