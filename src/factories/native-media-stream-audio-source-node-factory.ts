import { TNativeMediaStreamAudioSourceNodeFactoryFactory } from '../types';

export const createNativeMediaStreamAudioSourceNodeFactory: TNativeMediaStreamAudioSourceNodeFactoryFactory = (createNativeAudioNode) => {
    return (nativeAudioContext, { mediaStream }) => {
        const audioStreamTracks = mediaStream.getAudioTracks();
        const nativeMediaStreamAudioSourceNode = createNativeAudioNode(nativeAudioContext, (ntvDCntxt) => {
            /*
             * Bug #151: Safari does not use the audio track as input anymore if it gets removed from the mediaStream after construction.
             * Bug #159: Safari picks the first audio track if the MediaStream has more than one audio track.
             */
            audioStreamTracks.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

            const filteredAudioStreamTracks = audioStreamTracks.slice(0, 1);

            return ntvDCntxt.createMediaStreamSource(new MediaStream(filteredAudioStreamTracks));
        });

        /*
         * Bug #151 & #159: The given mediaStream gets reconstructed before it gets passed to the native node which is why the accessor
         * needs to be overwritten as it would otherwise expose the reconstructed version.
         */
        Object.defineProperty(nativeMediaStreamAudioSourceNode, 'mediaStream', { value: mediaStream });

        return nativeMediaStreamAudioSourceNode;
    };
};
