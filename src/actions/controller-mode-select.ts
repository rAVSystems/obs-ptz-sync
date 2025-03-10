import { streamDeck, action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

@action({ UUID: "com.ryan-peters.obs-ptz-sync.ptzcontroller" })

export class PtzController extends SingletonAction<PtzControllerSettings> {
    constructor() {
        super();
        streamDeck.settings.onDidReceiveGlobalSettings((ev) => {
            //streamDeck.logger.trace("global " + ev.settings.buttonSelected);
        });
    }
    override onWillAppear(ev: WillAppearEvent<PtzControllerSettings>): void | Promise<void> {
        streamDeck.settings.getGlobalSettings()
        return ev.action.setTitle(`${ev.payload.settings.id ?? ""}`);
    }

    override async onKeyDown(ev: KeyDownEvent<PtzControllerSettings>): Promise<void> {
        const { settings } = ev.payload;
        const actions = Array.from(streamDeck.actions);
        await Promise.all(actions.map(async (actionInstance) => {
            try {
                const actionSettings = await actionInstance.getSettings();
    
                if (actionSettings.id === settings.id) {
                    streamDeck.logger.trace(actionSettings.id + " selected");
                    if(actionInstance.isKey())
                        await actionInstance.setState(1);
                } else {
                    if(actionInstance.isKey())
                        await actionInstance.setState(0);
                }
            } catch (error) {
                streamDeck.logger.error("Error getting settings for action: " + error);
            }
        }));
    
        // Perform usual logic
        await ev.action.setSettings(settings);
        await ev.action.setTitle(`${settings.id}`);
        await streamDeck.settings.setGlobalSettings({
            buttonSelected: settings.id,
        });
        await streamDeck.settings.getGlobalSettings();
    }
}

type PtzControllerSettings = {
    id?: string;
};
