import { Circle, CODE, Code, Grid, Layout, Line, makeScene2D, Node, Rect, Txt } from "@motion-canvas/2d";
import { all, chain, createRef, createSignal, DEFAULT, Direction, easeOutCubic, lazy, linear, PossibleVector2, range, SimpleSignal, slideTransition, useRandom, Vector2, waitFor, waitUntil, PossibleColor, easeOutBack, useLogger } from '@motion-canvas/core';


export default makeScene2D(function* (view) {
    view.fill("rgb(2,23,18)");
    yield* slideTransition(Direction.Right, 1);

    const generator = useRandom(3);
    const sizeX = createSignal<number>(700);
    const sizeY = createSignal<number>(400);
    const posY = createSignal<number>(0);
    const chunkSize = createSignal<number>(100);

    /// CODE
    const scaling = Code.createSignal(``);
    const declarations = Code.createSignal(``);
    const code = createRef<Code>();
    view.add(<Code
        ref={code}
        code={CODE`\
        float PerlinNoise(vec2 coord){
            ${scaling}

            ${declarations}
        }
`}
        opacity={0}
        y={80}
        x={500}
    />);

    /// MAP
    const mapSizeOpacity = createSignal(0);
    const container = createRef<Rect>();
    view.add(<Rect
        ref={container}
        x={-600}
        y={posY}
        width={sizeX}
        height={sizeY}
        lineWidth={4}
        stroke={"white"}
        radius={20}
        opacity={0}
        clip
    >
        <Grid
            spacing={chunkSize}
            lineWidth={4}
            stroke={"rgb(87, 84, 84)"}
            lineDash={[20, 20]}
            x={-50}
            y={() => -posY()}
            size={'100%'}
        />
    </Rect>)
    view.add(<Node opacity={mapSizeOpacity} >
        <Txt
            bottom={() => container().top().addY(-20)}
            text="map size (x)"
            fill="white"
            fontSize={35}
        />
        <Line
            x={container().x}
            y={() => container().y() - container().height() / 2}
            endArrow
            startArrow
            points={[[-container().width() / 2, 0], [container().width() / 2, 0]]}
            lineWidth={5}
            arrowSize={20}
            stroke="rgb(98, 181, 250)"
        />
    </Node>
    )
    yield* waitUntil("start");
    yield* view.fill("rgb(2, 3, 4)", 1);
    yield* all(code().y(DEFAULT, .4, easeOutCubic), code().opacity(1, .4, easeOutCubic))
    yield* chain(waitUntil("show map"), container().opacity(1, .5, easeOutCubic));
    yield* waitUntil("increase mapSize")
    yield* chain(sizeX(1000, 1), sizeY(800, 1), posY(300, 1), all(sizeX(700, 1), sizeY(400, 1), posY(0, 1)));

    yield* waitUntil("scale 1");
    yield* all(
        scaling(`\
coord /= mapSize.x;\
`, 1
        ),
        chunkSize(sizeX, 1)
    )
    yield* waitFor(0.8);
    yield* all(
        sizeX(1000, 1),
        sizeY(650, 1),
    )
    yield* posY(-300, 1).back(1);

    yield* waitUntil("scale 3");
    yield* all(
        scaling(`\
coord /= mapSize.x * 7;\
`, 1
        ),
        chunkSize(() => sizeX() / 7, 1)
    )
    yield* waitUntil("declarations");
    yield* declarations(`vec2 bl = floor(coord); // bottom left`, .8);
    yield* waitUntil("oxoy");
    yield* declarations(`\
vec2 bl = floor(coord); // bottom left
            ox = fract(coord.x);
            oy = fract(coord.y)`, .8);

    yield* container().x(-2000, 1);
    container().remove();
    const coord = createSignal<PossibleVector2>([-200, 130])
    const toRandom = createSignal<PossibleVector2>([-300, -100])
    const arrow = createRef<Line>();
    const arrowX = createRef<Line>();
    const arrowY = createRef<Line>();
    const randomVector = createRef<Line>();
    const textOpacity = createSignal(0);
    const abOpacity = createSignal(0);
    const color_point = createSignal<PossibleColor>("rgb(53,220,241)");
    yield* view.add(<Rect
        ref={container}
        size={700}
        lineWidth={4}
        stroke={"white"}
        radius={20}
        x={-2700}
    >
        <Circle
            size={40}
            fill="rgb(169, 34, 34)"
            stroke="white"
            x={-350}
            y={350}
            lineWidth={4}
        >
            <Txt
                text={"Bottom\nLeft"}
                y={100}
                opacity={textOpacity}
                x={-70}
                fill="white"
                fontFamily={"Poppins"}
                textAlign={"center"}
            />
        </Circle>
        <Circle
            size={40}
            fill={() => color_point()}
            stroke="white"
            position={coord}
            lineWidth={4}
        >
            <Txt
                text={"coord"}
                opacity={textOpacity}
                y={-50}
                x={100}
                fill="white"
                fontFamily={"Poppins"}
                textAlign={"center"}
            />
        </Circle>
        <Line
            ref={arrow}
            end={0}
            points={() => [[-350, 350], coord]}
            stroke={"white"}
            lineWidth={10}
            zIndex={-1}
            endArrow
            endOffset={20}
        >
            <Txt
                text="a"
                fill="white"
                position={() => arrow().getPointAtPercentage(0.5).position.add(arrow().getPointAtPercentage(0.5).normal.mul(-50))}
                opacity={() => arrow().end() * abOpacity()}
                fontFamily={"Poppins"}
            />
        </Line>
        <Line
            ref={arrowX}
            end={0}
            points={() => [[-350, 0], [coord()[0], 0]]}
            y={350}
            stroke={"rgb(239, 99, 99)"}
            lineWidth={10}
            zIndex={-1}
            endArrow
        >
            <Txt
                text="ox"
                fill="rgb(239, 99, 99)"
                x={() => coord()[0] + 30}
                opacity={() => arrowX().end() * textOpacity()}
                y={50}
                fontFamily={"Poppins"}
            />
        </Line>
        <Line
            ref={arrowY}
            end={0}
            x={-350}
            points={() => [[0, 350], [0, coord()[1]]]}
            stroke={"rgb(164, 238, 108)"}
            lineWidth={10}
            zIndex={-1}
            endArrow
        >
            <Txt
                text="oy"
                fill="rgb(164, 238, 108)"
                opacity={() => arrowY().end() * textOpacity()}
                x={() => -70}
                y={() => coord()[1] + 30}
                fontFamily={"Poppins"}
            />

        </Line>
        <Line
            ref={randomVector}
            position={[-350, 350]}
            points={() => [[0, 0], toRandom()]}
            stroke={"rgb(235, 149, 22)"}
            lineWidth={10}
            zIndex={-1}
            endArrow
            end={0}

        >
            <Txt
                text="b"
                fill="rgb(235, 149, 22)"
                position={() => randomVector().getPointAtPercentage(0.5).position.add(randomVector().getPointAtPercentage(0.5).normal.mul(-50))}
                opacity={() => randomVector().end() * abOpacity()}
                fontFamily={"Poppins"}
            />
        </Line>
    </Rect>)
    yield* container().x(-700, 1);
    yield textOpacity(1, 1);
    yield* arrow().end(1, 1);
    yield* all(
        arrowX().end(() => 1 * textOpacity(), 1),
        arrowY().end(() => 1 * textOpacity(), 1)
    );
    yield* waitUntil("move coord");
    yield* chain(...range(5).map(i => coord([generator.nextInt(-350, 350), generator.nextInt(-350, 350)], 1)));

    yield* all(
        code().x(1900, 1),
        container().x(0, 1),
        textOpacity(0, 1),

    )

    view.add(
        <Rect
            fill="rgba(0,0,0,.9)"
            radius={10}
            padding={15}
            y={450}
            layout
            opacity={abOpacity}
            gap={32}
        >
            <Txt
                fontFamily={"Fira Code"}
                fill="rgb(198, 201, 249)"

            >
                <Txt fill="white" >a</Txt>.dot(<Txt fill="rgb(235, 149, 22)" >b</Txt>) = <Txt></Txt>
            </Txt>
            <Txt
                fontFamily={"Fira Code"}
                fill="rgb(133, 229, 101)"
                text={() => {
                    var dir1 = arrow().getPointAtPercentage(1).position.sub(arrow().getPointAtPercentage(0).position);
                    var dir2 = randomVector().getPointAtPercentage(1).position.sub(randomVector().getPointAtPercentage(0).position);
                    dir1 = dir1.normalized;
                    dir2 = dir2.normalized;
                    var val = dir1.dot(dir2);

                    return `${val.toFixed(2)}`;
                }}
            />
        </Rect>
    )
    color_point(() => {
        var dir1 = arrow().getPointAtPercentage(1).position.sub(arrow().getPointAtPercentage(0).position);
        var dir2 = randomVector().getPointAtPercentage(1).position.sub(randomVector().getPointAtPercentage(0).position);
        dir1 = dir1.normalized;
        dir2 = dir2.normalized;
        var val = dir1.dot(dir2);
        const c = Math.floor((val + 1) / 2 * 255)

        return `rgb(${c},${c},${c})`;

    })
    yield* waitUntil("r vector");
    yield* all(randomVector().end(1, 1), abOpacity(1, 1));
    yield* waitUntil("dot");
    yield* chain(...range(2).map(i => coord([generator.nextInt(-350, 350), generator.nextInt(-350, 350)], 1)));
    yield* chain(...range(2).map(i => toRandom([generator.nextInt(-350, 350), generator.nextInt(-350, -150)], 1)));
    yield* chain(...range(2).map(i => coord([generator.nextInt(-350, 350), generator.nextInt(-350, 350)], 1)));
    yield* chain(...range(2).map(i => toRandom([generator.nextInt(-350, 350), generator.nextInt(-350, -150)], 1)));
    yield* chain(...range(2).map(i => coord([generator.nextInt(-350, 350), generator.nextInt(-350, 350)], 1)));
    yield* chain(...range(1).map(i => toRandom([generator.nextInt(-350, 350), generator.nextInt(-350, -150)], 1)));
    yield* toRandom([-350, 100], 1);
    yield* chain(...range(2).map(i => coord([generator.nextInt(-350, 350), generator.nextInt(-350, 350)], 1)));

    yield* waitUntil("end");
})