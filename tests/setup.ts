/**
 * Test setup file for vitest
 * Mocks canvas 2D context for testing
 */

import { vi } from 'vitest';

// Mock HTMLCanvasElement.getContext for 2D context
HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
  if (contextType === '2d') {
    return {
      canvas: document.createElement('canvas'),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'left',
      textBaseline: 'alphabetic',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      clearRect: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
      transform: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      createImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1
      })),
      getImageData: vi.fn((x: number, y: number, w: number, h: number) => ({
        data: new Uint8ClampedArray(w * h * 4),
        width: w,
        height: h
      })),
      putImageData: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      })),
      createPattern: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      isPointInPath: vi.fn(() => false),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      arcTo: vi.fn()
    } as any;
  }
  return null;
}) as any;
