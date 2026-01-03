import { useState, useRef, MouseEvent } from 'react';

function deg2rad(deg: number): number {
  return deg * Math.PI / 180;
}

function arc(rx: number, ry: number, xAxisRotation: number, largeArcFlag: number, sweepFlag: number, x: number, y: number): string {
  return `A${rx},${ry},${xAxisRotation},${largeArcFlag},${sweepFlag},${x},${y}`;
}

function move(x: number, y: number): string {
  return `M${x},${y}`;
}

function line(x: number, y: number): string {
  return `L${x},${y}`;
}

function ease(pos: number): number {
  // pos [0..1]
  if (pos < 0.8) {
    const t = pos / 0.8;
    return t * t * t;
  }
  return 1 + Math.sin((pos - 0.8) / 0.2 * Math.PI) * 0.1;
}

interface CompassLogoProps {
  radius?: number;
}

function CompassLogo({ radius = 18 }: CompassLogoProps) {
  const [rotation, setRotation] = useState(300);
  const timerRef = useRef<number | null>(null);
  const northRotation = 300;
  const innerRadius = 3;
  const needleInnerRadius = 5;

  const width = radius * 2 + 4;
  const height = radius * 2 + 4;
  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = radius;

  const getNeedlePath = (): string => {
    const angle = deg2rad(45);
    
    // arc start
    const sx = cx + Math.sin(angle) * needleInnerRadius;
    const sy = cy - Math.cos(angle) * needleInnerRadius;
    
    // arc end
    const ex = sx;
    const ey = cy + Math.cos(angle) * needleInnerRadius;
    
    // tip of needle
    const tx = cx + radius - 2;
    const ty = cy;
    
    return `${move(sx, sy)} ${arc(needleInnerRadius, needleInnerRadius, 0, 0, 1, ex, ey)} ${line(tx, ty)}`;
  };

  const southNeedleTransform = `rotate(180,${cx},${cy})`;
  const transform = `translate(${cx},${cy}) rotate(${rotation}) translate(-${cx},-${cy})`;

  const handleMouseEnter = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const deltaX = e.clientX - rect.left - width / 2;
    const deltaY = -(e.clientY - rect.top - height / 2);
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    setRotation(360 - angle);
  };

  const handleMouseLeave = () => {
    let startRotation = rotation;
    startRotation = startRotation >= 360 ? startRotation - 360 : startRotation;
    
    let delta = northRotation - startRotation;
    const direction = delta > 180 ? -1 : 1;
    
    if (direction === -1) {
      delta = 360 - delta;
    }
    
    const startTime = Date.now();
    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      let pos = (now - startTime) / 1000;
      if (pos >= 1) {
        pos = 1;
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
      setRotation(startRotation + direction * ease(pos) * delta);
    }, 10);
  };

  return (
    <svg
      width={width}
      height={height}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer"
    >
      <circle
        cx={cx}
        cy={cy}
        r={outerRadius}
        fill="none"
        className="logo-outer-circle"
      />
      <circle
        cx={cx}
        cy={cy}
        r={innerRadius}
        className="logo-inner-circle"
      />
      <g transform={transform}>
        <path
          d={getNeedlePath()}
          className="logo-needle north"
        />
        <path
          d={getNeedlePath()}
          className="logo-needle"
          transform={southNeedleTransform}
        />
      </g>
    </svg>
  );
}

export default CompassLogo;
