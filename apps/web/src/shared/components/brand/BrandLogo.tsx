import { cn } from '../../styles'

type Props = {
  className?: string
  iconOnly?: boolean
}

export function BrandLogo({ className, iconOnly = false }: Props) {
  const imageClass = cn('h-10 max-w-full w-auto shrink-0 object-contain object-left', className)

  if (iconOnly) return <img className={cn('block', imageClass)} src="/brand/love-my-document-mark.png" alt="LoveMyDocument" draggable={false} decoding="async" />

  return <>
    <img className={cn('block in-data-[theme=dark]:hidden', imageClass)} src="/brand/love-my-document-wordmark-complete.png" alt="LoveMyDocument" draggable={false} decoding="async" />
    <img className={cn('hidden in-data-[theme=dark]:block', imageClass)} src="/brand/love-my-document-wordmark-dark.png" alt="LoveMyDocument" draggable={false} decoding="async" />
  </>
}
