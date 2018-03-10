import { Injector } from '@angular/core';
import { INVALID_STATE_ERROR_FACTORY_PROVIDER, InvalidStateErrorFactory } from '../factories/invalid-state-error';
import { getNativeContext } from '../helpers/get-native-context';
import { isOfflineAudioContext } from '../helpers/is-offline-audio-context';
import { IAudioParam, IMinimalBaseAudioContext, IOscillatorNode, IOscillatorOptions } from '../interfaces';
import {
    TChannelCountMode,
    TChannelInterpretation,
    TNativeOscillatorNode,
    TOscillatorType,
    TUnpatchedAudioContext,
    TUnpatchedOfflineAudioContext
} from '../types';
import { NoneAudioDestinationNode } from './none-audio-destination-node';

const injector = Injector.create({
    providers: [
        INVALID_STATE_ERROR_FACTORY_PROVIDER
    ]
});

const invalidStateErrorFactory = injector.get(InvalidStateErrorFactory);

// The DEFAULT_OPTIONS are only of type Partial<IOscillatorOptions> because there is no default value for periodicWave.
const DEFAULT_OPTIONS: Partial<IOscillatorOptions> = {
    channelCount: 2,
    channelCountMode: <TChannelCountMode> 'max', // This attribute has no effect for nodes with no inputs.
    channelInterpretation: <TChannelInterpretation> 'speakers', // This attribute has no effect for nodes with no inputs.
    detune: 0,
    frequency: 440,
    numberOfInputs: 0,
    numberOfOutputs: 1,
    type: <TOscillatorType> 'sine'
};

const createNativeNode = (nativeContext: TUnpatchedAudioContext | TUnpatchedOfflineAudioContext) => {
    if (isOfflineAudioContext(nativeContext)) {
        throw new Error('This is not yet supported.');
    }

    return nativeContext.createOscillator();
};

export class OscillatorNode extends NoneAudioDestinationNode<TNativeOscillatorNode> implements IOscillatorNode {

    constructor (context: IMinimalBaseAudioContext, options: Partial<IOscillatorOptions> = DEFAULT_OPTIONS) {
        const nativeContext = getNativeContext(context);
        const mergedOptions = <IOscillatorOptions> { ...DEFAULT_OPTIONS, ...options };
        const nativeNode = createNativeNode(nativeContext);

        super(context, nativeNode, mergedOptions);
    }

    public get detune () {
        if (this._nativeNode === null) {
            throw new Error('The associated nativeNode is missing.');
        }

        return <IAudioParam> (<any> this._nativeNode.detune);
    }

    public get frequency () {
        if (this._nativeNode === null) {
            throw new Error('The associated nativeNode is missing.');
        }

        return <IAudioParam> (<any> this._nativeNode.frequency);
    }

    public get onended () {
        // @todo
        return (this._nativeNode === null) ? null : <any> this._nativeNode.onended;
    }

    public set onended (value) {
        if (this._nativeNode === null) {
            // @todo
        } else {
            this._nativeNode.onended = <any> value;
        }
    }

    public get type () {
        if (this._nativeNode !== null) {
            return this._nativeNode.type;
        }

        throw new Error('This is not yet supported.');
    }

    public set type (value) {
        if (this._nativeNode === null) {
            throw new Error('This is not yet supported.');
        }

        this._nativeNode.type = value;

        // Bug #57: Edge will not throw an error when assigning the type to 'custom'. But it still will change the value.
        if (value === 'custom') {
            throw invalidStateErrorFactory.create();
        }
    }

    public setPeriodicWave (periodicWave: PeriodicWave) {
        if (this._nativeNode === null) {
            throw new Error('This is not yet supported.');
        }

        this._nativeNode.setPeriodicWave(periodicWave);
    }

    public start (when = 0) {
        if (this._nativeNode === null) {
            throw new Error('This is not yet supported.');
        }

        this._nativeNode.start(when);
    }

    public stop (when = 0) {
        if (this._nativeNode === null) {
            throw new Error('This is not yet supported.');
        }

        this._nativeNode.stop(when);
    }

}
