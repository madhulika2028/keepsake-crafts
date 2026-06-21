import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KImage, Rect, Text, Transformer, Group } from "react-konva";
import useImage from "use-image";
import type Konva from "konva";
import type { FramelyProduct } from "@/lib/framely-data";

export type MockupTransform = { x: number; y: number; scale: number; rotation: number };
export type MockupState = {
  side: "front" | "back";
  colorId?: string;
  transform: MockupTransform;
  text?: string;
};

const CANVAS = 560;

function pctRect(product: FramelyProduct) {
  const { x, y, w, h } = product.printArea;
  return {
    x: (x / 100) * CANVAS,
    y: (y / 100) * CANVAS,
    w: (w / 100) * CANVAS,
    h: (h / 100) * CANVAS,
  };
}

export default function LiveMockupCanvas({
  product,
  photoDataUrl,
  state,
  onChange,
  onSafeChange,
}: {
  product: FramelyProduct;
  photoDataUrl: string | null;
  state: MockupState;
  onChange: (s: MockupState) => void;
  onSafeChange?: (safe: boolean) => void;
}) {
  const stageRef = useRef<Konva.Stage>(null);
  const imgRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [productImg] = useImage(product.image, "anonymous");
  const [userImg] = useImage(photoDataUrl ?? "", "anonymous");
  const [selected, setSelected] = useState(false);
  const safe = pctRect(product);

  // tint overlay color
  const color = product.colors?.find((c) => c.id === state.colorId)?.hex;

  useEffect(() => {
    if (selected && imgRef.current && trRef.current) {
      trRef.current.nodes([imgRef.current]);
      trRef.current.getLayer()?.batchDraw();
    } else if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selected, userImg]);

  // initial place user image centered in print area on first load
  useEffect(() => {
    if (userImg && state.transform.x === 0 && state.transform.y === 0 && state.transform.scale === 1) {
      const targetW = safe.w * 0.9;
      const scale = targetW / userImg.width;
      onChange({
        ...state,
        transform: {
          x: safe.x + safe.w / 2,
          y: safe.y + safe.h / 2,
          scale,
          rotation: 0,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userImg]);

  // safe area check
  useEffect(() => {
    if (!userImg || !onSafeChange) return;
    const { x, y, scale, rotation } = state.transform;
    // approximate AABB
    const w = userImg.width * scale;
    const h = userImg.height * scale;
    const cos = Math.abs(Math.cos((rotation * Math.PI) / 180));
    const sin = Math.abs(Math.sin((rotation * Math.PI) / 180));
    const bw = w * cos + h * sin;
    const bh = w * sin + h * cos;
    const left = x - bw / 2;
    const top = y - bh / 2;
    const right = x + bw / 2;
    const bottom = y + bh / 2;
    const inside = left >= safe.x && top >= safe.y && right <= safe.x + safe.w && bottom <= safe.y + safe.h;
    onSafeChange(inside);
  }, [state.transform, userImg, safe.x, safe.y, safe.w, safe.h, onSafeChange]);

  const handleDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage()) setSelected(false);
  };

  return (
    <Stage
      ref={stageRef}
      width={CANVAS}
      height={CANVAS}
      onMouseDown={handleDeselect}
      onTouchStart={handleDeselect}
      style={{ touchAction: "none", maxWidth: "100%", height: "auto" }}
    >
      <Layer>
        {productImg && (
          <KImage image={productImg} x={0} y={0} width={CANVAS} height={CANVAS} listening={false} />
        )}
        {color && (
          <Rect x={0} y={0} width={CANVAS} height={CANVAS} fill={color} opacity={0.35} listening={false} />
        )}
      </Layer>

      <Layer>
        <Rect
          x={safe.x}
          y={safe.y}
          width={safe.w}
          height={safe.h}
          stroke="#ffffff"
          strokeWidth={1.5}
          dash={[6, 6]}
          opacity={0.7}
          listening={false}
        />
      </Layer>

      <Layer>
        {userImg && (
          <KImage
            ref={imgRef}
            image={userImg}
            x={state.transform.x}
            y={state.transform.y}
            offsetX={userImg.width / 2}
            offsetY={userImg.height / 2}
            scaleX={state.transform.scale}
            scaleY={state.transform.scale}
            rotation={state.transform.rotation}
            draggable
            onClick={() => setSelected(true)}
            onTap={() => setSelected(true)}
            onDragEnd={(e) =>
              onChange({
                ...state,
                transform: { ...state.transform, x: e.target.x(), y: e.target.y() },
              })
            }
            onTransformEnd={() => {
              const node = imgRef.current;
              if (!node) return;
              const newScale = node.scaleX();
              onChange({
                ...state,
                transform: {
                  x: node.x(),
                  y: node.y(),
                  scale: newScale,
                  rotation: node.rotation(),
                },
              });
            }}
          />
        )}
        {state.text && (
          <Group listening={false}>
            <Text
              text={state.text}
              x={safe.x}
              y={safe.y + safe.h - 36}
              width={safe.w}
              align="center"
              fontSize={20}
              fontStyle="600"
              fontFamily="Poppins, sans-serif"
              fill="#ffffff"
              shadowColor="#000000"
              shadowBlur={6}
              shadowOpacity={0.5}
            />
          </Group>
        )}
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(_oldBox, newBox) => {
            if (newBox.width < 30 || newBox.height < 30) return _oldBox;
            return newBox;
          }}
        />
      </Layer>
    </Stage>
  );
}
