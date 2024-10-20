import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Graphics, Text, useApp } from "@pixi/react";

import { LINE_CAP, LINE_JOIN, Graphics as PixiGraphics } from "@pixi/graphics";
import { Container } from "@pixi/react-animated";
import { TextMetrics, TextStyle } from "@pixi/text";
import { Circle, ColorSource, Rectangle } from "pixi.js";
import { useSpring } from "react-spring";

type DotProps = {
  position: [number, number];
  size?: number;
  form?: "cross" | "circle";
  text?: string;
  color?: ColorSource;
  extPoninterOver?: boolean;
  extSetPointerOver?: Dispatch<SetStateAction<boolean>>;
};

export default function Dot({
  position,
  size = 10,
  form = "circle",
  text = "",
  color = 0xffffff,
  extPoninterOver,
  extSetPointerOver,
}: DotProps) {
  const [poninterOver, setPointerOver] = useState<boolean>(false);

  const handlePointer = useCallback(
    (value: boolean) => {
      if (extSetPointerOver) {
        extSetPointerOver(value);
      } else {
        setPointerOver(value);
      }
    },
    [extSetPointerOver]
  );

  const draw = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      switch (form) {
        case "circle":
          g.beginFill(color);
          g.drawCircle(0, 0, extPoninterOver || poninterOver ? 10 : size);
          break;
        case "cross":
          g.lineStyle({
            width: extPoninterOver || poninterOver ? 3 : 2,
            color,
            cap: LINE_CAP.ROUND,
            join: LINE_JOIN.ROUND,
          });

          g.moveTo(-3, -3);
          g.lineTo(+3, +3);

          g.moveTo(+3, -3);
          g.lineTo(-3, +3);
          break;
        default:
          break;
      }
    },
    [color, extPoninterOver, form, poninterOver, size]
  );

  const app = useApp();

  const style = useMemo(
    () =>
      new TextStyle({
        // align: "center",
        // fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
        fontSize: 30,
        // lineHeight: 30,
        // fontWeight: "400",
        fill: ["#ffffff"], // gradient
        // fillGradientStops: [0, 0.1, 1, 0],
        // fillGradientType: TEXT_GRADIENT.LINEAR_HORIZONTAL,
        stroke: "#000000",
        strokeThickness: 2,
        // letterSpacing: 20,
        // dropShadow: true,
        // dropShadowColor: "#ccced2",
        // dropShadowBlur: 4,
        // dropShadowAngle: Math.PI / 6,
        // dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 400,
      }),
    []
  );

  const metrics = useMemo(
    () => TextMetrics.measureText(text, style),
    [style, text]
  );

  const { offsetRight, offsetLeft, offsetBottom, offsetTop } = useMemo(
    () => ({
      offsetRight:
        position[0] + metrics.width + 11 + 10 > app.screen.width
          ? app.screen.width - (position[0] + metrics.width + 11 + 10)
          : 0,
      offsetLeft: 0,
      offsetBottom:
        position[1] + metrics.height - 20 + 5 > app.screen.height
          ? app.screen.height - (position[1] + metrics.height - 20 + 2)
          : 0,
      offsetTop: position[1] - 20 < 0 ? 0 - (position[1] - 20) : 0,
    }),
    [app, metrics, position]
  );

  const [dotProps, dotApi] = useSpring<{
    position: [number, number];
    alpha: number;
    scale: [number, number];
  }>(() => {
    return {
      from: { alpha: 0.5, scale: [2, 2] },
      to: { position, alpha: 1, scale: [1, 1] },
      config: {
        tension: 19,
        friction: 10,
      },
    };
  }, [position]);

  const [textProps, textApi] = useSpring<{
    x: number;
    y: number;
    alpha: number;
    scale: [number, number];
  }>(
    () => ({
      from: { alpha: 0, scale: [0.5, 0.5] },
      to: {
        x: 11 + offsetRight,
        y: -20 + offsetTop + offsetBottom,
        alpha: 1,
        scale: [1, 1],
      },
    }),
    [offsetRight, offsetTop, offsetBottom]
  );

  useEffect(() => {
    if (extPoninterOver || poninterOver) {
      textApi.start({ reset: true });
    }
  }, [dotApi, extPoninterOver, poninterOver, textApi]);

  return (
    <Container {...dotProps} zIndex={extPoninterOver || poninterOver ? 999 : 0}>
      <Graphics
        draw={draw}
        onpointerenter={() => handlePointer(true)}
        onpointerleave={() => handlePointer(false)}
        hitArea={new Circle(0, 0, 10)}
      />
      {(extPoninterOver || poninterOver) && (
        <Container {...textProps}>
          <Graphics
            draw={(g) => {
              g.clear();
              g.beginFill(0xd0d0d0);
              g.drawRoundedRect(0, 0, metrics.width + 10, metrics.height, 5);
            }}
            alpha={0.9}
            hitArea={new Rectangle(0, 0, 0, 0)}
            eventMode="none"
          />
          <Text text={text} x={5} style={style} />
        </Container>
      )}
    </Container>
  );
}
