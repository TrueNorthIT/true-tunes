// import React, { useEffect, useState } from 'react';
// import { IAlbumEntity } from '@components/result-types/albumEntity';
// import { ITrackEntity } from '@components/result-types/trackEntity';
// import { useSonosContext } from '@providers/SonosContext';
// import TrackEntity from '@components/result-types/trackEntity';

// interface AlbumViewProps {
//     album: IAlbumEntity;
//     onBack?: () => void;
// }

// const AlbumView: React.FC<AlbumViewProps> = ({ album, onBack }) => {
//     const player = useSonosContext();
//     const [tracks, setTracks] = useState<ITrackEntity[]>([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         setLoading(true);
//         player.getTracksForAlbum(album.id).then((result) => {
//             setTracks(result.mediaMetadata || []);
//             setLoading(false);
//         });
//     }, [album]);

//     return (
//         <div className="p-6 max-w-4xl mx-auto">
//             {onBack && (
//                 <button onClick={onBack} className="mb-4 text-sm text-indigo-400 hover:underline">
//                     ← Back to search
//                 </button>
//             )}

//             <div className="flex items-start gap-6">
//                 <img src={album.albumArtURI} alt={album.title} className="w-32 h-32 object-cover rounded-lg" />
//                 <div>
//                     <h1 className="text-2xl font-bold text-white">{album.title}</h1>
//                     <p className="text-gray-400">{album.artist}</p>
//                 </div>
//             </div>

//             <div className="mt-6">
//                 <h2 className="text-xl font-semibold text-white mb-3">Track List</h2>
//                 {loading ? (
//                     <p className="text-gray-400">Loading tracks...</p>
//                 ) : (
//                     <div className="space-y-2">
//                         {tracks.map((track, i) => (
//                             <TrackEntity
//                                 key={track.id}
//                                 entity={track}
//                                 playing={false}
//                                 small={true}
//                                 showImage={false}
//                                 isSearchResult={true}
//                             />
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AlbumView;
