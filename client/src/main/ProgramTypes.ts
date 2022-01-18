import { Vector3 } from "three";
import type { DeviceIds } from "video-mirror";

import type { WorldDoc } from "~/y-integration/WorldDoc";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import { PageParams } from "~/types/PageParams";
import { AVConnection } from "~/av/AVConnection";

import type {
  Appearance,
  AuthenticationHeaders,
  Participant,
} from "~/identity/types";

import type {
  State as ParticipantState,
  Message as ParticipantMessage,
} from "~/identity/ProgramTypes";

export type State = {
  // initialization
  participantId?: string;
  pageParams?: PageParams;
  authHeaders?: AuthenticationHeaders;
  entrywayPosition: Vector3;
  entrywayUnsub: Function;

  // relm metadata
  relmDocId?: string; // server-assigned UUID for the relm
  permits?: string[];
  assetsMax?: number;
  assetsCount?: number;
  entitiesMax?: number;
  entitiesCount?: number;
  twilioToken?: string;

  // audio/video setup
  audioVideoSetupDone?: boolean;
  audioDesired?: boolean;
  videoDesired?: boolean;
  preferredDeviceIds?: DeviceIds;
  avConnection?: AVConnection;
  avDisconnect?: Function;

  // avatar setup
  avatarSetupDone?: boolean;

  // create worldDoc & establish yjs connection
  physicsEngine?: any;
  ecsWorld?: DecoratedECSWorld;
  ecsWorldLoaderUnsub?: Function;
  worldDoc?: WorldDoc;
  initializedWorldManager?: boolean;

  // other
  doneLoading?: boolean;
  errorMessage?: string;
  overlayScreen?: "portal";
  screen?:
    | "error"
    | "initial"
    | "video-mirror"
    | "choose-avatar"
    | "loading-screen"
    | "loading-failed"
    | "game-world";

  // composed state
  participantState: ParticipantState;
};

export type Message =
  | { id: "gotPageParams"; pageParams: PageParams }
  | { id: "gotAuthenticationHeaders"; authHeaders: AuthenticationHeaders }
  | { id: "enterPortal"; relmName: string; entryway: string }
  | { id: "didResetWorld" }
  | {
      id: "gotRelmPermitsAndMetadata";
      permits: string[];
      relmDocId: string;
      entitiesMax: number;
      assetsMax: number;
      twilioToken: string;
    }
  | { id: "importedPhysicsEngine"; physicsEngine: any }
  | { id: "createdWorldDoc"; worldDoc: WorldDoc }
  | {
      id: "createdECSWorld";
      ecsWorld: DecoratedECSWorld;
      ecsWorldLoaderUnsub: Function;
    }
  | { id: "gotEntrywayUnsub"; entrywayUnsub: Function }
  | { id: "gotPositionFromEntryway"; entrywayPosition: Vector3 }
  | { id: "assumeOriginAsEntryway" }
  | { id: "gotEntrywayPosition" }
  | { id: "didMakeLocalParticipant"; localParticipant: Participant }
  | { id: "setUpAudioVideo" }
  | { id: "didSetUpAudioVideo"; state: any }
  | { id: "didJoinAudioVideo"; avDisconnect: Function }
  | { id: "setUpAvatar" }
  | { id: "didSetUpAvatar"; appearance?: Appearance }
  | { id: "initWorldManager" }
  | { id: "didInitWorldManager" }
  | { id: "loading" }
  | { id: "loaded" }
  | { id: "loadedAndReady" }
  | { id: "startPlaying" }
  | { id: "participantMessage"; message: ParticipantMessage }
  | { id: "error"; message: string; stack?: any };

export type Dispatch = (message: Message) => void;
