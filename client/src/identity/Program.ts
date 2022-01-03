import { Cmd } from "~/utils/runtime";
import { Vector3 } from "three";

import { Participant } from "./types";
import { playerId } from "./playerId";
// import { ChatMessage } from "~/world/ChatManager";
import { Avatar2 } from "./Avatar2";
import { setAppearance, setAvatarFromParticipant } from "./Avatar";

import { makeLocalParticipant } from "./effects/makeLocalParticipant";
import { subscribeBroker } from "./effects/subscribeBroker";

import { Program, State, Message, Effect, Dispatch } from "./ProgramTypes";
import { setTransformArrayOnParticipants } from "./Avatar/transform";
import { makeRemoteAvatar } from "./Avatar/makeAvatar";
import { exists } from "~/utils/exists";

export function makeProgram(this: void): Program {
  return {
    init: [
      {
        participants: new Map(),
        unsubs: [],
        activeCache: [],
      },
    ],
    update(msg: Message, state: State) {
      switch (msg.id) {
        case "init": {
          exists(state.participants, "participants");
          exists(msg.ecsWorld, "ecsWorld");

          return [
            {
              ...state,
              worldDoc: msg.worldDoc,
              ecsWorld: msg.ecsWorld,
              entrywayPosition: msg.entrywayPosition,
            },
            Cmd.batch<Effect>([
              subscribeBroker(msg.worldDoc, msg.ecsWorld, state.participants),
              makeLocalParticipant(
                msg.ecsWorld,
                msg.entrywayPosition,
                msg.appearance
              ),
            ]),
          ];
        }

        case "join": {
          state.localParticipant.identityData.status = "present";
          return [state];
        }

        case "didSubscribeBroker": {
          const newState = { ...state, broker: msg.broker };
          newState.unsubs.push(msg.unsub);
          return [newState];
        }

        case "didMakeLocalParticipant": {
          state.participants.set(playerId, msg.localParticipant);
          return [
            { ...state, localParticipant: msg.localParticipant },
            Cmd.ofMsg<Message>({
              id: "sendParticipantData",
              participantId: playerId,
              updateData: msg.localParticipant.identityData,
            }),
          ];
        }

        case "recvParticipantData": {
          let participant;

          if (state.participants.has(msg.participantId)) {
            participant = state.participants.get(msg.participantId);
            participant.identityData = msg.identityData;
            participant.modified = true;
            // console.log(
            //   "recvParticipantData (exists)",
            //   msg.participantId,
            //   msg.identityData
            // );
          } else {
            participant = {
              participantId: msg.participantId,
              identityData: msg.identityData,
              isLocal: msg.isLocal,
              modified: true,
              /* no avatar yet, because this may be a stale participant */
            };
            state.participants.set(msg.participantId, participant);
            // console.log(
            //   "recvParticipantData (new)",
            //   msg.participantId,
            //   msg.identityData
            // );
          }

          return [state];
        }

        case "sendParticipantData": {
          const participant: Participant = state.participants.get(
            msg.participantId
          );
          // console.log(
          //   "sendParticipantData",
          //   msg.participantId,
          //   msg.updateData,
          //   state.participants
          // );
          const identityData = {
            ...participant.identityData,
            ...msg.updateData,
          };
          state.broker.setIdentityData(msg.participantId, identityData);
          return [state];
        }

        default:
          return [state];
      }
    },

    view(state: State, dispatch: Dispatch) {},
  } as Program;
}
