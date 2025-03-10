import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { PtzController } from "./actions/controller-mode-select";

streamDeck.logger.setLevel(LogLevel.TRACE);
streamDeck.actions.registerAction(new PtzController());
streamDeck.connect();
