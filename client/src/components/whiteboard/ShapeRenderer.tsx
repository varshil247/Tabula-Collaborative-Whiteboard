/**
 * Component for rendering individual Konva shapes on the canvas
 * Handles all shape types including pen, shapes, images, and text
 */

import React, { useEffect, useState } from "react";
import {
  Line,
  Rect,
  Circle,
  Star,
  Ellipse,
  Text,
  RegularPolygon,
  Image as KonvaImage,
} from "react-konva";

interface ShapeRendererProps {
  shape: any;
  activeTool: string;
  selectedShapeIds: string[];
  stageScale: number;
  isLive?: boolean;
  opacity?: number;
  remoteLiveObject?: any;
  onSelect?: (e: any, id: string) => void;
  onTransformMove?: (e: any, id: string) => void;
  onTransformEnd?: (shape: any, e: any) => void;
  onTextDblClick?: (shape: any) => void;
}

/**
 * Sub-component for rendering images with CORS support
 */
const CanvasImage = ({ shape, commonProps }: { shape: any; commonProps: any }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = shape.config.url;
    img.onload = () => setImage(img);
    img.onerror = () => {
      console.error(`🖼️ Failed to load image: ${shape.config.url}`);
      setImage(null);
    };
  }, [shape.config.url]);

  return (
    <KonvaImage
      {...commonProps}
      image={image || undefined}
      width={shape.config.width}
      height={shape.config.height}
    />
  );
};

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({
  shape,
  activeTool,
  selectedShapeIds,
  stageScale,
  isLive = false,
  opacity = 1,
  remoteLiveObject,
  onSelect,
  onTransformMove,
  onTransformEnd,
  onTextDblClick,
}) => {
  const displayX = remoteLiveObject ? remoteLiveObject.posX : shape.posX;
  const displayY = remoteLiveObject ? remoteLiveObject.posY : shape.posY;
  const displayScaleX = remoteLiveObject ? remoteLiveObject.scaleX : shape.config.scaleX || 1;
  const displayScaleY = remoteLiveObject ? remoteLiveObject.scaleY : shape.config.scaleY || 1;
  const displayRot = remoteLiveObject ? remoteLiveObject.rotation : shape.config.rotation || 0;
  const isSelected = selectedShapeIds.includes(shape.uuid) && !isLive;

  const commonProps = {
    id: shape.uuid,
    x: displayX,
    y: displayY,
    scaleX: displayScaleX,
    scaleY: displayScaleY,
    rotation: displayRot,
    opacity: opacity,
    draggable: activeTool === "select" && !isLive && selectedShapeIds.includes(shape.uuid),
    onClick: (e: any) => !isLive && onSelect?.(e, shape.uuid),
    onTap: (e: any) => !isLive && onSelect?.(e, shape.uuid),
    onDragMove: (e: any) => onTransformMove?.(e, shape.uuid),
    onTransform: (e: any) => onTransformMove?.(e, shape.uuid),
    onDragEnd: (e: any) => onTransformEnd?.(shape, e),
    onTransformEnd: (e: any) => onTransformEnd?.(shape, e),
    onMouseEnter: (e: any) => {
      if (activeTool === "select" && !isLive) {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "pointer";
      }
    },
    onMouseLeave: (e: any) => {
      if (activeTool === "select" && !isLive) {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "";
      }
    },
    ...(isSelected
      ? {
          stroke: "#3b82f6",
          strokeWidth: 2 / stageScale,
          shadowColor: "#3b82f6",
          shadowBlur: 10,
          shadowOpacity: 0.5,
        }
      : {}),
  };

  switch (shape.shape) {
    case "pen":
      return (
        <Line
          key={shape.uuid}
          {...commonProps}
          points={shape.config.points}
          stroke={shape.config.stroke}
          strokeWidth={shape.config.strokeWidth}
          globalCompositeOperation={shape.config.globalCompositeOperation || "source-over"}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
        />
      );
    case "rectangle":
      return (
        <Rect
          key={shape.uuid}
          {...commonProps}
          width={shape.config.width}
          height={shape.config.height}
          fill={shape.config.fill}
        />
      );
    case "circle":
      return (
        <Circle
          key={shape.uuid}
          {...commonProps}
          radius={shape.config.radius}
          fill={shape.config.fill}
        />
      );
    case "star":
      return (
        <Star
          key={shape.uuid}
          {...commonProps}
          numPoints={shape.config.numPoints}
          innerRadius={shape.config.innerRadius}
          outerRadius={shape.config.outerRadius}
          fill={shape.config.fill}
        />
      );
    case "triangle":
      return (
        <RegularPolygon
          key={shape.uuid}
          {...commonProps}
          sides={3}
          radius={shape.config.radius}
          fill={shape.config.fill}
        />
      );
    case "hexagon":
      return (
        <RegularPolygon
          key={shape.uuid}
          {...commonProps}
          sides={6}
          radius={shape.config.radius}
          fill={shape.config.fill}
        />
      );
    case "ellipse":
      return (
        <Ellipse
          key={shape.uuid}
          {...commonProps}
          radiusX={shape.config.radiusX}
          radiusY={shape.config.radiusY}
          fill={shape.config.fill}
        />
      );
    case "text":
      return (
        <Text
          key={shape.uuid}
          {...commonProps}
          text={shape.config.text}
          fontSize={shape.config.fontSize}
          fontFamily={shape.config.fontFamily}
          fill={shape.config.fill}
          padding={5}
          onDblClick={() => !isLive && onTextDblClick?.(shape)}
          onDblTap={() => !isLive && onTextDblClick?.(shape)}
        />
      );
    case "image":
      return <CanvasImage key={shape.uuid} shape={shape} commonProps={commonProps} />;
    default:
      return null;
  }
};
