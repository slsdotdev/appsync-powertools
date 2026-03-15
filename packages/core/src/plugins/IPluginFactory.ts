import { ITransformerContext } from "../context/ITransformerContext.js";
import { ITransformerPlugin } from "./ITransformerPlugin.js";

export interface IPluginFactory {
  create(context: ITransformerContext): ITransformerPlugin;
}
