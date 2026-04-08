import { useEffect, useRef } from "react"
import gsap from "gsap"

const LiquidBackground = () => {
  const containerRef = useRef(null)

  useEffect(() => {
    const blobs = containerRef.current.querySelectorAll(".blob")
    
    blobs.forEach((blob, i) => {
      gsap.to(blob, {
        x: "random(-100, 100)",
        y: "random(-100, 100)",
        duration: "random(15, 25)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 2
      })
      
      gsap.to(blob, {
        scale: "random(0.8, 1.2)",
        rotation: "random(0, 360)",
        duration: "random(10, 20)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      })
    })
  }, [])

  return (
    <div ref={containerRef} style={{
      position: "fixed", inset: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none",
      background: "var(--bg-base)"
    }}>
      {/* Royal Blue Blob */}
      <div className="blob" style={{
        position: "absolute", top: "10%", left: "15%",
        width: "40vw", height: "40vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(74, 139, 223, 0.12) 0%, transparent 70%)",
        filter: "blur(60px)"
      }} />
      
      {/* Eggplant Blob */}
      <div className="blob" style={{
        position: "absolute", bottom: "10%", right: "15%",
        width: "35vw", height: "35vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(160, 0, 109, 0.08) 0%, transparent 70%)",
        filter: "blur(60px)"
      }} />

      {/* Center Soft Blob */}
      <div className="blob" style={{
        position: "absolute", top: "40%", left: "40%",
        width: "50vw", height: "50vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(224, 242, 247, 0.2) 0%, transparent 70%)",
        filter: "blur(80px)"
      }} />
    </div>
  )
}

export default LiquidBackground
