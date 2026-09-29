import { createActor } from 'xstate';
import { describe, expect, it } from 'vitest';
import { videoCallMachine } from '../core/machines/videoCall.machine';

const agora = {
  channelName: 'call-1',
  token: 'token',
  uid: 123,
  appId: 'app-id',
};

describe('video call state machine', () => {
  it('keeps local media through the outgoing connection flow', () => {
    const actor = createActor(videoCallMachine).start();
    const audioTrack = { kind: 'audio' } as never;
    const videoTrack = { kind: 'video' } as never;

    actor.send({
      type: 'REQUEST_CALL',
      receiverId: 'receiver',
      receiverName: 'Receiver',
      receiverAvatar: '',
      chatId: 'chat-1',
      callerName: 'Caller',
      callerAvatar: '',
      callType: 'video',
    });
    actor.send({ type: 'MEDIA_INITIALIZED', localAudioTrack: audioTrack, localVideoTrack: videoTrack });
    actor.send({ type: 'CALL_OUTGOING', callId: 'call-1' });
    actor.send({ type: 'CALL_ACCEPTED', callId: 'call-1', agora });
    actor.send({ type: 'AGORA_CONNECTED' });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('connected');
    expect(snapshot.context.localAudioTrack).toBe(audioTrack);
    expect(snapshot.context.localVideoTrack).toBe(videoTrack);
    expect(snapshot.context.agoraChannel).toBe('call-1');
  });

  it('preserves voice call type and supports audio-only media', () => {
    const actor = createActor(videoCallMachine).start();
    const audioTrack = { kind: 'audio' } as never;

    actor.send({
      type: 'CALL_INCOMING',
      callId: 'call-1',
      callerId: 'caller',
      callerName: 'Caller',
      callerAvatar: '',
      chatId: 'chat-1',
      callType: 'voice',
    });
    actor.send({ type: 'ACCEPT_CALL' });
    actor.send({ type: 'MEDIA_INITIALIZED', localAudioTrack: audioTrack, localVideoTrack: null });
    actor.send({ type: 'CALL_PROCEED', callId: 'call-1', agora });
    actor.send({ type: 'AGORA_CONNECTED' });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('connected');
    expect(snapshot.context.callType).toBe('voice');
    expect(snapshot.context.localAudioTrack).toBe(audioTrack);
    expect(snapshot.context.localVideoTrack).toBeNull();
  });

  it('applies the authoritative duration when call:started arrives after connection', () => {
    const actor = createActor(videoCallMachine).start();

    actor.send({
      type: 'CALL_INCOMING',
      callId: 'call-1',
      callerId: 'caller',
      callerName: 'Caller',
      callerAvatar: '',
      chatId: 'chat-1',
      callType: 'video',
    });
    actor.send({ type: 'ACCEPT_CALL' });
    actor.send({ type: 'CALL_PROCEED', callId: 'call-1', agora });
    actor.send({ type: 'AGORA_CONNECTED' });
    actor.send({ type: 'CALL_STARTED', callId: 'call-1', startTime: 42, duration: 180 });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('connected');
    expect(snapshot.context.startTime).toBe(42);
    expect(snapshot.context.duration).toBe(180);
    expect(snapshot.context.remainingTime).toBe(180);
  });

  it('ends a ringing call when the caller cancels', () => {
    const actor = createActor(videoCallMachine).start();

    actor.send({
      type: 'CALL_INCOMING',
      callId: 'call-1',
      callerId: 'caller',
      callerName: 'Caller',
      callerAvatar: '',
      chatId: 'chat-1',
      callType: 'video',
    });
    actor.send({ type: 'CALL_ENDED', callId: 'call-1', reason: 'cancelled', canRejoin: false });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('ended');
    expect(snapshot.context.canRejoin).toBe(false);
  });
});
