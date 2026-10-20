import { useId, useRef, useState } from 'react'
import { motion } from 'motion/react'
import './IgniteButton.css'

const pillPath =
  'M 120 1 H 216 A 23 23 0 0 1 239 24 A 23 23 0 0 1 216 47 H 24 A 23 23 0 0 1 1 24 A 23 23 0 0 1 24 1 H 120'

function IgniteButton({
  href,
  children,
  variant = 'pill',
  className = '',
  download,
  target,
  rel,
  onClick,
  ...props
}) {
  const [active, setActive] = useState(false)
  const sparkMotionRef = useRef(null)

    const startSpark = () => {
    const animation = sparkMotionRef.current
    if (!animation) return

    animation.endElement()
    animation.beginElement()
    setActive(true)
    }

    const stopSpark = () => {
    const animation = sparkMotionRef.current
    if (animation) animation.endElement()

    setActive(false)
    }
  const id = useId().replace(/:/g, '')
  const gradientId = `ignite-gradient-${id}`
  const path = variant === 'circle'
    ? 'M 50 3 A 47 47 0 1 1 49.99 3'
    : pillPath

  return (
    <motion.a
      href={href}
      download={download}
      target={target}
      rel={rel}
      onClick={onClick}
      className={`ignite-button ignite-button--${variant} ${
        active ? 'ignite-button--active' : ''
      } ${className}`}
      onHoverStart={startSpark}
      onHoverEnd={stopSpark}
      onFocus={startSpark}
      onBlur={stopSpark}
      onTapStart={startSpark}
      onTapCancel={stopSpark}
      onTap={stopSpark}
      {...props}
    >
      <span className="ignite-button__outline" aria-hidden="true" />

      <span className="ignite-button__surface">
        {children}
      </span>

      <svg
        aria-hidden="true"
        className="ignite-button__spark"
        viewBox={variant === 'circle' ? '0 0 100 100' : '0 0 240 48'}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#F8D9E8" stopOpacity="0.15" />
            <stop offset="35%" stopColor="#F8D9E8" stopOpacity="0.75" />
            <stop offset="65%" stopColor="#E4DDFB" stopOpacity="0.9" />
            <stop offset="88%" stopColor="#D5EEFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>
        </defs>

        {['long', 'medium', 'short', 'near'].map((length) => (
          <path
            key={length}
            className={`ignite-button__tail ignite-button__tail--${length}`}
            d={path}
            pathLength="1000"
            stroke={`url(#${gradientId})`}
          />
        ))}

        <circle className="ignite-button__spark-head" r="3.5">
        <animateMotion
        ref={sparkMotionRef}
        path={path}
        dur="6.5s"
        rotate="auto"
        begin="indefinite"
        repeatCount="indefinite"
        />
        </circle>
      </svg>
    </motion.a>
  )
}

export default IgniteButton
