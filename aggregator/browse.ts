import { fromEffect, flatMap } from "effect/Stream"
import { AIService } from "./ai"

export const browse = (url: string) =>
  fromEffect(AIService).pipe(flatMap((ai) => ai.generateStream(url)))
