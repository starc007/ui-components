---
title: "Best React Native Animation Libraries in 2027"
description: "A fair look at the best React Native animation libraries in 2027: Reanimated, Gesture Handler, Animated, Moti, Skia, Lottie, Rive and beUI Native."
publishedAt: 2026-11-26
tags: reactnative, animation, expo, typescript
product: native
draft: false
---

Your app works. It also feels stiff. Buttons don't react to a press, sheets snap open, lists jump when a row goes away. So you go looking for React Native animation libraries.

You find a dozen of them, half built on top of the other half. This post sorts them out: what each one is, its license, what it's best at, and which one to reach for.

Eight entries. Most real apps use two or three of them together.

## What makes a good React Native animation library?

Before the list, the things that matter on a phone:

- **Runs off the JS thread.** If an animation waits on JavaScript, a busy render drops frames. The good libraries run animation code on the UI thread.
- **Works with gestures.** Touch UI is drag, swipe and release. The animation has to follow a finger and pick up its speed on release.
- **Respects reduced motion.** iOS and Android both have a system setting for it. Your library should make it easy to read.
- **Fits the New Architecture.** Current versions of the big libraries require it. Check before you upgrade.

## 1. Reanimated

[Reanimated](https://docs.swmansion.com/react-native-reanimated/) from Software Mansion is the default answer for custom animation in React Native. MIT licensed.

You write animation logic as worklets that run on the UI thread, drive styles from shared values, and get springs, timing curves, layout animations (`entering`, `exiting`, `layout`) and a reduced motion hook out of the box. Reanimated 4 adds a CSS-style animations and transitions API on top of the worklet API.

Things to know: Reanimated 4 runs only on the New Architecture and needs `react-native-worklets` installed next to it. Apps still on the old architecture stay on Reanimated 3.

**Best for:** anything custom. Press feedback, sheets, drag and drop, shared values driven by gestures or scroll.

## 2. Gesture Handler

[React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/), also from Software Mansion and MIT licensed, is not an animation library. It's the gesture partner to Reanimated: pans, taps, long presses, pinches, recognized natively, with callbacks that can run on the UI thread.

Gesture Handler 3 moved to a hook-based API (`usePanGesture`, `useTapGesture` and so on) in place of the `Gesture.Pan()` builder, and renamed some callbacks (`onStart` became `onActivate`). If you follow an older tutorial, check the upgrade guide.

**Best for:** swipe to delete, draggable sheets, carousels, anything that tracks a finger.

## 3. The built-in Animated API

`Animated` ships with React Native. Nothing to install. It has `Animated.timing`, `Animated.spring`, `Animated.sequence`, interpolation, and `useNativeDriver: true`, which hands transform and opacity animations to the native side.

The limits: the native driver doesn't cover layout properties, and anything that has to react to a gesture or to JS state mid-flight gets awkward fast.

**Best for:** a fade or slide in a small app where you don't want another dependency.

## 4. Moti

[Moti](https://moti.fyi/) is a declarative layer on Reanimated. MIT licensed. You write `<MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} />` and it handles the rest, including mount and unmount animations and skeleton loaders.

Things to know: Moti describes itself as powered by Reanimated 3, and its latest npm release is from January 2025. If you're on Reanimated 4, test it in your project and check its GitHub issues before you commit to it.

**Best for:** teams who like a props-only, Framer Motion style API and are on a stack it supports.

## 5. React Native Skia

[React Native Skia](https://shopify.github.io/react-native-skia/) from Shopify brings the Skia 2D graphics engine to React Native. MIT licensed. You draw with paths, gradients, shaders, blur and text on a canvas, and animate it with Reanimated shared values.

It's a different tool from the rest of this list. You're not animating views, you're drawing pixels.

**Best for:** charts, custom loaders, shader effects, generative visuals, anything a `View` can't draw.

## 6. Lottie for React Native

[lottie-react-native](https://github.com/lottie-react-native/lottie-react-native) plays animations designers build in After Effects and export as Lottie files. Apache-2.0 licensed.

You get pixel-exact playback of a designer's animation with play, pause, progress and loop control. You don't get much interactivity beyond that.

**Best for:** onboarding illustrations, empty states, success animations made by a designer.

## 7. Rive

[Rive](https://rive.app/docs/runtimes/react-native) is a design tool plus open runtimes for playing what you make in it. The React Native runtime is MIT licensed; the editor is Rive's own product with its own plans.

Rive animations are interactive. State machines and data binding let the animation react to input and app state. Rive now recommends its new `@rive-app/react-native` package, built on Nitro Modules, over the older `rive-react-native` package, so start new projects on the new one.

**Best for:** interactive illustrations, animated mascots, icons with several states.

## 8. beUI Native

[beUI Native](https://beui.dev/react-native) is a set of ready-made animated components for React Native and Expo, built on Reanimated, Gesture Handler and Uniwind. Free and open source.

It's not an animation engine. It's the layer above one: a [spring-pressed button](https://beui.dev/react-native/button), a [swipeable list](https://beui.dev/react-native/swipeable-list) with row actions, [toasts](https://beui.dev/react-native/toast) that stack and swipe away, and more. Each one handles reduced motion and screen readers. You install the source into your app:

```bash
npx beui-native add button
```

The CLI writes the component files into your project and installs the libraries it needs. You own the code and can change any of it.

**Best for:** shipping common interactive components without building the motion and accessibility yourself.

## React Native animation libraries compared

| Library | License | Runs on | Best for |
| --- | --- | --- | --- |
| Reanimated | MIT | UI thread (worklets) | Custom animation of any kind |
| Gesture Handler | MIT | Native gesture system | Gestures that drive animation |
| Animated | Ships with React Native | Native driver for transform and opacity | Simple fades and slides |
| Moti | MIT | Reanimated | Declarative mount and state animations |
| React Native Skia | MIT | Skia canvas | Drawn graphics, shaders, charts |
| Lottie | Apache-2.0 | Native Lottie players | Designer-made playback |
| Rive | MIT runtime | Rive renderer | Interactive, stateful illustrations |
| beUI Native | Free, open source | Reanimated + Gesture Handler | Ready-made animated components |

## Which React Native animation library should you use?

Short version:

- **Building custom motion?** Reanimated. Add Gesture Handler as soon as a finger is involved.
- **One fade in a small app?** The built-in `Animated` API is fine.
- **Drawing, not moving views?** Skia.
- **A designer handed you an animation file?** Lottie for After Effects exports, Rive for interactive work made in Rive.
- **You need a button, a list, a toast, an OTP field?** Start from beUI Native and edit the source.

These aren't rivals. A typical app uses Reanimated plus Gesture Handler for its own interactions, Lottie or Rive for a few illustrations, and ready-made components for the common parts.

## A Reanimated press scale example

Here is the smallest useful Reanimated animation: a button that scales down on press with a spring, and dims instead when the user has reduced motion turned on.

```tsx title="press-scale-button.tsx"
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PRESS_SPRING = { damping: 20, stiffness: 400 };

export function PressScaleButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  function pressIn() {
    if (reduceMotion) opacity.value = withTiming(0.7, { duration: 100 });
    else scale.value = withSpring(0.96, PRESS_SPRING);
  }

  function pressOut() {
    opacity.value = withTiming(1, { duration: 150 });
    scale.value = withSpring(1, PRESS_SPRING);
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[styles.button, animatedStyle]}
    >
      <Text style={styles.label}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  label: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
```

What's going on:

- `useSharedValue` holds the scale on the UI thread, so the press never waits on a React render.
- `useAnimatedStyle` maps the shared values to a style, again on the UI thread.
- `withSpring` gives the press a physical feel and handles interruption. Press and release fast and it just reverses from wherever it is.
- `useReducedMotion` reads the system setting once. With it on, the button dims rather than moves.

## FAQ

### Is Reanimated better than the Animated API?

For anything beyond a simple fade or slide, yes. Reanimated runs animation logic on the UI thread, works with gestures, and has layout animations. `Animated` is built in and fine for small, non-interactive animations.

### Does Reanimated 4 work with Expo?

Yes, on the New Architecture. Install it with `npx expo install react-native-reanimated react-native-worklets`. Apps on the old architecture need Reanimated 3.

### Should I use Lottie or Rive in React Native?

Use Lottie if your designers work in After Effects and you need playback. Use Rive if the animation has to react to input or app state, since its state machines handle that in the file itself.

### Are there ready-made animated components for React Native?

Yes. [beUI Native](https://beui.dev/react-native) has free animated components built on Reanimated and Gesture Handler that you install as source, so you can edit them.

## Takeaway

Pick Reanimated and Gesture Handler as your base. Add Skia, Lottie or Rive when the job is drawing or playing designed animation. Don't hand-build the same button, list and toast every project.

Browse the components at [beui.dev/react-native](https://beui.dev/react-native), follow the [setup guide](https://beui.dev/docs/native-setup), then add your first one:

```bash
npx beui-native add swipeable-list
```
