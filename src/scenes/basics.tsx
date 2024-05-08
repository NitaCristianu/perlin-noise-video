import { Node, Rect, Circle, makeScene2D, Txt, Line } from '@motion-canvas/2d';
import { all, createRef, createRefArray, createSignal, DEFAULT, easeOutBack, easeOutCubic, PossibleColor, PossibleVector2, range, Reference, SimpleSignal, useRandom, Vector2, waitFor, waitUntil } from '@motion-canvas/core';
import { COLOR1, COLOR1_10, COLOR2, COLOR2_10, COLOR2_20, COLOR2_RGB } from '../config';

export function Point(props: { animate?: SimpleSignal<number>, tag?: string | SimpleSignal<string>, position?: PossibleVector2, color?: PossibleColor, ref?: Reference<Circle> }) {
  return <Circle
    ref={props.ref}
    position={props.position}
    size={20}
    opacity={props.animate}
    fill={props.color || "white"}
    shadowColor={props.color || "white"}
    shadowBlur={5}
  >
    <Txt
      text={props.tag}
      fill={props.color || "white"}
      textAlign={'center'}
      y={-40}
      fontFamily={"Poppins"}
      fontWeight={200}
    />
  </Circle>
}
export function Segment(props: { animate?: SimpleSignal<number>, tag?: string, color?: PossibleColor, ref1: Reference<Circle>, ref2: Reference<Circle> }) {
  return <Line
    points={() => [
      props.ref1().position(),
      props.ref2().position(),
    ]}
    opacity={props.animate}
    end={props.animate}
    lineWidth={8}
    stroke={props.color || "white"}

  >
    <Txt
      position={() => props.ref1().position().add(props.ref2().position()).div(2)}
      text={props.tag}
    />
  </Line>
}

export default makeScene2D(function* (view) {
  const ASPECT_RATIO = 5 / 3;
  const GRID_SIZE = 25;
  const cell_size = createSignal(0);
  const container = createRef<Rect>();
  const texts = createRefArray<Txt>();
  const cells = createRefArray<Rect>();
  const generator = useRandom();
  const title = createRef<Txt>();
  const bgr_rect = createRef<Rect>();
  const bgr_rect2 = createRef<Rect>();
  view.add(
    <Rect y={-155}>
      <Txt
        ref={title}
        text={"INPUT"}
        textAlign={'center'}
        fontFamily={"Poppins"}
        y={() => -container().size().y / 2 + 40}
        x={() => container().x() - 27}
        scale={cell_size}
        fill="white"
      />
      <Rect
        ref={bgr_rect}
        size={[2400, 2000]}
        zIndex={-2}
        fill="rgb(2, 13, 8)"
        rotation={6}
        x={3000}
      >
        <Rect
          ref={bgr_rect2}
          size={[2400, 2400]}
          zIndex={-2}
          fill="rgb(2, 23, 18)"
          rotation={6}
          x={2850}
        >

        </Rect>

      </Rect>
      <Rect
        ref={container}
        size={[800 * ASPECT_RATIO, 800]}
        direction={'row'}
        wrap={'wrap'}
        scale={0.7}
        layout
        y={100}
        x={2000}
        gap={36}
      >

        {...range(GRID_SIZE).map(i => (
          <Rect
            ref={cells}
            size={800 * ASPECT_RATIO / 6}
            fill={COLOR1_10}
            lineWidth={4}
            stroke={COLOR1}
            justifyContent={'center'}
            alignItems={'center'}
            shadowBlur={8}
            shadowColor={COLOR1}
            radius={20}
          >
            <Txt
              ref={texts}
              text={`${i % 5}, ${Math.floor(i / 5)}`}
              textAlign={'center'}
              fontFamily={"Poppins"}
              fill="white"
              scale={cell_size}
            />
          </Rect>
        ))}
      </Rect>
    </Rect>
  );

  // introduce the map
  yield* waitUntil('start');
  yield* all(
    cell_size(1, .4, easeOutCubic),
    container().y(DEFAULT, .4, easeOutCubic),
    container().x(DEFAULT, 1.7, easeOutCubic),
    bgr_rect().x(600, 1.7, easeOutCubic)
  );
  yield* waitUntil("output");
  yield* all(
    ...cells.map(cell => cell.fill(COLOR2_10, 1)),
    ...cells.map(cell => cell.stroke(COLOR2, 1)),
    ...cells.map(cell => cell.shadowColor(COLOR2, 1)),
    ...texts.map(text => text.text(`${generator.nextFloat(-1, 1).toFixed(2)}`, 1)),
    title().text("OUTPUT", 1)
  );

  yield* waitUntil("range");
  const axis = createRef<Line>();
  const animateAxis = createSignal<number>(0);
  const a = createRef<Circle>();
  const b = createRef<Circle>();
  const b_tag = createSignal("1");
  const color = COLOR2;
  view.add(
    <Line
      ref={axis}
      stroke={"white"}
      lineWidth={5}
      points={[[-400, 0], [400, 0]]}
      x={700}
      end={animateAxis}
      endArrow
      startArrow
    >
      <Node y={75} x={-250} scale={animateAxis}>
        <Txt
          text="output range"
          textAlign={"right"}
          fontFamily={"Poppins"}
          scale={0.7}
          fill="white"
        />
        <Line
          lineWidth={10}
          stroke={color}
          points={[[-50, 0], [50, 0]]}
          x={200}
        />
      </Node>
      <Segment
        ref1={a}
        ref2={b}
        animate={animateAxis}
        color={color}
      />
      <Point
        tag="O"
        position={[0, 0]}
        animate={animateAxis}
      />
      <Point
        ref={a}
        tag="-1"
        position={[-150, 0]}
        color={color}
        animate={animateAxis}
      />
      <Point
        ref={b}
        tag={b_tag}
        position={[150, 0]}
        color={color}
        animate={animateAxis}
      />
    </Line>)
  yield* all(
    container().x(-650, 1),
    bgr_rect2().x(850, 1),
    bgr_rect().width(4000, 1),
    bgr_rect().height(4000, 1)
  )
  yield* animateAxis(1, 1);
  cells.forEach(cell => cell.save());
  texts.forEach(text => text.save());
  yield* waitUntil("paint");
  yield* all(
    ...cells.map((cell, i) => {
      const m = parseFloat(texts[i].text());
      const n = 1 - parseFloat(texts[i].text());
      const s = `rgb(${Math.floor(m * 255)},${Math.floor(m * 255)},${Math.floor(m * 255)})`;
      const s2 = `rgb(${Math.floor(n * 255)},${Math.floor(n * 255)},${Math.floor(n * 255)})`;
      return all(
        cell.fill(s, 1),
        cell.stroke(s2, 1),
        texts[i].fill(s2, 1),
        cell.shadowBlur(0, 1)
      );
    })
  )
  yield* waitUntil("unpaint");
  yield* all(...cells.map(cell => cell.restore(1)));
  yield* all(...texts.map(text => text.restore(1)));

  yield* waitUntil("black");
  view.add(<Rect
    fill="black"
    size={140}
    radius={40}
    lineWidth={4}
    stroke={"rgb(2,23,18)"}
    y={550}
    x={-1100}
  >
    <Txt
      text="0"
      fontFamily={"Poppins"}
      fill="white"
    />
  </Rect>)
  yield* waitUntil("white");
  view.add(<Rect
    fill="white"
    size={140}
    radius={40}
    lineWidth={4}
    stroke={"rgb(2,23,18)"}
    y={550}
    x={-900}
  >
    <Txt
      text="1"
      fontFamily={"Poppins"}
      fill="black"
    />
  </Rect>)
  yield* waitUntil("gray");
  view.add(<Rect
    fill="gray"
    size={140}
    radius={40}
    lineWidth={4}
    stroke={"rgb(2,23,18)"}
    y={550}
    x={-700}
  >
    <Txt
      text="0.5"
      fontFamily={"Poppins"}
      fill="black"
    />
  </Rect>)

  yield* waitUntil("add1");
  yield* all(
    ...texts.map(t => {
      var new_text = t.text();
      new_text = `${(parseFloat(new_text) + 1).toFixed(2)}`;

      return t.text(new_text, 1);
    }),

    a().position([0, 0], 1),
    b().position([300, 0], 1),
    b_tag("2", .5),
    a().scale(0, 1)
  )
  yield* waitUntil("*0.5");
  yield* all(
    ...texts.map(t => {
      var new_text = t.text();
      new_text = `${(parseFloat(new_text) * 0.5).toFixed(2)}`;

      return t.text(new_text, 1);
    }),

    b().position([150, 0], 1),
    b_tag("1", 0.4),
  )
  yield* waitUntil("paint2");
  yield* all(
    ...cells.map((cell, i) => {
      const m = parseFloat(texts[i].text());
      const n = 1 - parseFloat(texts[i].text());
      const s = `rgb(${Math.floor(m * 255)},${Math.floor(m * 255)},${Math.floor(m * 255)})`;
      const s2 = `rgb(${Math.floor(n * 255)},${Math.floor(n * 255)},${Math.floor(n * 255)})`;
      return all(
        cell.fill(s, 1),
        cell.stroke(s2, 1),
        texts[i].fill(s2, 1),
        cell.shadowBlur(0, 1)
      );
    })
  )
  yield* waitUntil("end");
});
