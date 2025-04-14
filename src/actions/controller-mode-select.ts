import { streamDeck, action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

// gives your action a unique id
@action({ UUID: "com.ryan-peters.obs-ptz-sync.ptzcontroller" })

// extends the singleAction class adding PtzControllerSettings id property
export class PtzController extends SingletonAction<PtzControllerSettings> {
    // default constructor for testing an event handler from global settings, move to plugin.ts
    constructor() {
        super();
        streamDeck.settings.onDidReceiveGlobalSettings((ev) => {
            // streamDeck.logger.trace("global " + ev.settings.buttonSelected);
            
        });
    }

    // event fires when the app becomes visible on the stream deck
    override onWillAppear(ev: WillAppearEvent<PtzControllerSettings>): void | Promise<void> {
        // get the latest global settings
        streamDeck.settings.getGlobalSettings();
        // set the titles to all buttons appropriately
        return ev.action.setTitle(`${ev.payload.settings.id ?? ""}`);
    }

    // event fires when the key is pressed
    override async onKeyDown(ev: KeyDownEvent<PtzControllerSettings>): Promise<void> {
        const { settings } = ev.payload;

        const actions = Array.from(streamDeck.actions);
        await Promise.all(actions.map(async (actionInstance) => {
            try {
                const actionSettings = await actionInstance.getSettings();
                if (actionSettings.id === settings.id) {
                    streamDeck.logger.trace(actionSettings.id + " selected");
                    if (actionInstance.isKey())
                        await actionInstance.setState(1);
                } else {
                    if (actionInstance.isKey())
                        await actionInstance.setState(0);
                }
            } catch (error) {
                streamDeck.logger.error("Error getting settings for action: " + error);
            }
        }));

        await streamDeck.settings.setGlobalSettings({
            buttonSelected: settings.id,
        });

        await streamDeck.settings.getGlobalSettings();

        streamDeck.logger.error("Key pressed with settings: " + JSON.stringify(settings));
        // Construct the URL for the HTTP GET request
        if (settings.controllerIp && settings.controlId) {
            const url = `http://${settings.controllerIp}/cgi-bin/aw_cam?cmd=XCN:01:${settings.controlId}&res=1`;
            streamDeck.logger.info("Constructed URL: " + url);

            try {
                const response = await fetch(url);
            
                if (response.ok) {
                    const data = await response.text(); // or .json() if it's JSON data
                    streamDeck.logger.info("Request successful: " + data);
                } else {
                    streamDeck.logger.error("Request failed: " + response.statusText);
                }
            } catch (error) {
                streamDeck.logger.error("Error performing HTTP request: " + error);
            }
        } else {
            streamDeck.logger.error("controllerIp or controlId not provided in the settings.");
        }
    }
}

type PtzControllerSettings = {
    id?: string;
    controllerIp?: string;
    controlId?: string;
};