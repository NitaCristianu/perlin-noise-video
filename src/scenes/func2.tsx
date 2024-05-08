import { CODE, Code, makeScene2D, Rect, Txt } from "@motion-canvas/2d";
import harshnoise from "../shaders/harshnoise.glsl";
import finalnoise from "../shaders/final.glsl";
import bottomleft from "../shaders/bottomleft.glsl";
import bottomright from "../shaders/bottomright.glsl";
import topleft from "../shaders/topleft.glsl";
import topright from "../shaders/topright.glsl";
import { all, createRef, createSignal, Direction, easeInCubic, easeOutCubic, linear, slideTransition, waitUntil } from "@motion-canvas/core";

export default makeScene2D(function* (view) {

    const bottomLeft = Code.createSignal(`
    vec2 bl_random = random2D(bl);
    // generate a random vector
    // using the seed bl
    // Assuming 'random2D(bl)' consistently
    // returns the same vector for the 'bl' seed.

    float dotBL = dot(gradBL, vec2(ox, oy));

    float v = (dotBL + 1.0) / 2.0;
    return v;
    `);

    const bl = createRef<Rect>();
    const br = createRef<Rect>();
    const tl = createRef<Rect>();
    const tr = createRef<Rect>();
    view.add(<>
        <Rect
            ref={bl}
            shaders={bottomleft}
            size={800}
            x={-600}
        />
        <Txt
            opacity={() => bl().opacity() - 0.5}
            text="Bottom left"
            fontFamily={"Poppins"}
            fill="white"
            bottom={bl().top}
        />
    </>
    );
    view.add(<>
        <Rect
            ref={br}
            shaders={bottomright}
            size={800}
            x={-350}
            opacity={0}
            scale={0.5}
        />
        <Txt
            opacity={() => br().opacity() - 0.5}
            text="Bottom right"
            fontFamily={"Poppins"}
            fill="white"
            bottom={br().top}
        />
    </>
    );
    view.add(<>
        <Rect
            ref={tr}
            shaders={topright}
            size={800}
            x={100}
            opacity={0}
            scale={0.5}
        />
        <Txt
            opacity={() => tr().opacity() - 0.5}
            text="Top right"
            fontFamily={"Poppins"}
            fill="white"
            bottom={tr().top}
        />
    </>
    );
    view.add(<>
        <Rect
            ref={tl}
            shaders={topleft}
            size={800}
            x={550}
            opacity={0}
            scale={0.5}
        />
        <Txt
            opacity={() => tl().opacity() - 0.5}
            text="Top left"
            fontFamily={"Poppins"}
            fill="white"
            bottom={tl().top}
        />
    </>
    );
    const code = createRef<Code>();
    view.add(<Code
        ref={code}
        fontSize={39}
        code={CODE`\
float PerlinNoise(vec2 coord){
    coord /= mapSize.x * 7.0;

    vec2 bl = floor(coord);
    ox = fract(coord.x);
    oy = fract(coord.y);
    ${bottomLeft}
}
        `}
        x={600}
    />)
    yield* slideTransition(Direction.Left, 1.0);

    yield* waitUntil("4 maps");
    code().save();
    yield* code().x(2000, 1);
    bl().save();
    tl().save();
    br().save();
    tr().save();
    yield* all(
        bl().scale(0.5, 1),
        br().opacity(1, 1),
        bl().x(-800, 1),
        tr().opacity(1, 1),
        tl().opacity(1, 1),
        view.x(view.width() / 2 + 100, 1)
    )
    yield* waitUntil("redo");
    view.add(<Code
        ref={code}
        y={50}
        fontSize={35}
        code={`\
float PerlinNoise(vec2 coord){
    coord /= mapSize.x * 7.0;

    vec2 bl = floor(coord);
    vec2 br = floor(coord) + vec2(1.0, 0.0);
    vec2 tl = floor(coord) + vec2(0.0, 1.0);
    vec2 tr = floor(coord) + vec2(1.0, 1.0);

    vec2 random_bl = random2D(bl);
    vec2 random_br = random2D(br);
    vec2 random_tr = random2D(tr);
    vec2 random_tl = random2D(tl);

    vec2 bl_o = fract(coord); 
    // distance from bl to the pixel (ox, oy)
    vec2 br_o = fract(coord - vec2(1.0, 0)); 
    // distance from br to the pixel
    vec2 tr_o = fract(coord - vec2(0.0, 1.0)); 
    // distance from tr to the pixel
    vec2 tl_o = fract(coord - vec2(1.0, 1.0)); 
    // distance from tl to the pixel

    float dotBL = dot(random_bl, bl_o);
    float dotBR = dot(random_br, br_o);
    float dotTR = dot(random_tr, tr_o);
    float dotTL = dot(random_tl, tl_o);
    // This is basically the same code repeated 4 times
    // for every corner
}`}
    />)
    yield* all(
        bl().opacity(0, 1),
        br().restore(1),
        tr().restore(1),
        tl().restore(1),
        code().opacity(1, 0.4, easeOutCubic),
        code().y(0, 0.4, easeOutCubic),
    )
    yield* waitUntil("mering");
    yield* all(
        bl().opacity(1, 1),
        br().opacity(1, 1),
        tr().opacity(1, 1),
        tl().opacity(1, 1),
        code().opacity(0, 1)
    );
    yield* waitUntil("separate");
    yield* all(
        view.x(view.width() / 2, 1),
        bl().y(300, 1),
        bl().x(-300, 1),
        br().y(300, 1),
        br().x(300, 1),
        tl().y(-300, 1),
        tl().x(-300, 1),
        tr().y(-300, 1),
        tr().x(300, 1),
        br().opacity(1, 1),
        code().opacity(0, 1)
    );
    const v = Code.createSignal(`float a = mix(dotBL, dotBR, bl_o.x);
    float b = mix(dotTL, dotTR, bl_o.x);`);
    const b = Code.createSignal(``);
    yield* waitUntil("horizontal_blend");
    view.add(<Code
        ref={code}
        y={50}
        fontSize={40}
        x={400}
        opacity={0}
        code={CODE`\
float PerlinNoise(vec2 coord){
    coord /= mapSize.x * 7.0;
    ...
    float dotBL = dot(random_bl, bl_o);
    float dotBR = dot(random_br, br_o);
    float dotTR = dot(random_tr, tr_o);
    float dotTL = dot(random_tl, tl_o);
    ${b}
    ${v}
}`}
    />)
    const main = createRef<Rect>();
    view.add(<Rect
        ref={main}
        shaders={harshnoise}
        size={400}
        opacity={0}
        x={-800}
    />)
    yield* all(
        bl().opacity(0.5, 0.8),
        bl().x(-800, 1),
        br().opacity(0.5, 0.8),
        br().x(-800, 1),
        tl().opacity(0.5, 0.8),
        tl().x(-800, 1),
        tr().opacity(0.5, 0.8),
        tr().x(-800, 1),
        code().opacity(1.0, 1, easeOutCubic),
    );
    yield* waitUntil("lerp again");
    yield* all(
        main().opacity(1.0, 1),
        main().scale(2.0, 1),
        bl().y(0, 0.8),
        bl().opacity(0, 0.8),
        br().y(0, 0.8),
        br().opacity(0, 0.8),
        tl().y(0, 0.8),
        tl().opacity(0, 0.8),
        tr().opacity(0, 0.8),
        tr().y(0, 0.8),
        v(`float a = mix(dotBL, dotBR, bl_o.x);
    float b = mix(dotTL, dotTR, bl_o.x);
    float v = mix(a, b, bl_o.y);`, 1),
    )

    yield* waitUntil("blur");
    const final = createRef<Rect>();
    const myTime = createSignal(0);
    view.add(<Rect
        ref = {final}
        shaders={{
            fragment : finalnoise,
            uniforms : {
                myTime : myTime
            }
        }}
        size={800}
        x={-800}
        zIndex={-1}
    />)
    yield* all(
        v(`float a = mix(dotBL, dotBR, blur.x);
    float b = mix(dotTL, dotTR, blur.x);
    float v = mix(a, b, blur.y)
    return v`, 1),
        b(`\

    vec2 blur = smoothstep(0.0, 1.0, bl_o);        `, 1),
    main().opacity(0.0, 1),
    )
    yield* waitUntil("show");
    yield all(
        final().position([0,0], 1),
        code().opacity(0.0, 1.0),
        myTime(200, 1000, linear),
    )
    yield* waitUntil("next");
})