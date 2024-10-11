import { useSonosContext } from "./providers/SonosContext";
import Image, { StaticImageData } from "next/image";
import { useEffect, useState } from "react";

import truenorth_logo from "../public/images/truenorth_logo.png";
import TrackEntity from "./result-types/trackEntity";
import { Track } from "@svrooij/sonos/lib/models";

export default function Queue() {

    const player = useSonosContext();


    const fakeQueue: Track[] = [
        {
            Artist: "Radiohead",
            Title: "Karma Police",
            Album: "OK Computer",
            AlbumArtUri: "https://link-to-album-art.com/radiohead_ok_computer.jpg"
        },
        {
            Artist: "Daft Punk",
            Title: "Get Lucky",
            Album: "Random Access Memories",
            AlbumArtUri: "https://link-to-album-art.com/daft_punk_ram.jpg"
        },
        {
            Artist: "Kendrick Lamar",
            Title: "HUMBLE.",
            Album: "DAMN.",
            AlbumArtUri: "https://link-to-album-art.com/kendrick_lamar_damn.jpg"
        },
        {
            Artist: "Arctic Monkeys",
            Title: "Do I Wanna Know?",
            Album: "AM",
            AlbumArtUri: "https://link-to-album-art.com/arctic_monkeys_am.jpg"
        },
        {
            Artist: "The Beatles",
            Title: "Come Together",
            Album: "Abbey Road",
            AlbumArtUri: "https://link-to-album-art.com/beatles_abbey_road.jpg"
        },
        {
            Artist: "Tame Impala",
            Title: "The Less I Know The Better",
            Album: "Currents",
            AlbumArtUri: "https://link-to-album-art.com/tame_impala_currents.jpg"
        },
        {
            Artist: "Billie Eilish",
            Title: "Bad Guy",
            Album: "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?",
            AlbumArtUri: "https://link-to-album-art.com/billie_eilish_when_we_all_fall_asleep.jpg"
        },
        {
            Artist: "Fleetwood Mac",
            Title: "Dreams",
            Album: "Rumours",
            AlbumArtUri: "https://link-to-album-art.com/fleetwood_mac_rumours.jpg"
        },
        {
            Artist: "The Weeknd",
            Title: "Blinding Lights",
            Album: "After Hours",
            AlbumArtUri: "https://link-to-album-art.com/weeknd_after_hours.jpg"
        },
        {
            Artist: "Nirvana",
            Title: "Smells Like Teen Spirit",
            Album: "Nevermind",
            AlbumArtUri: "https://link-to-album-art.com/nirvana_nevermind.jpg"
        },
        {
            Artist: "Coldplay",
            Title: "Fix You",
            Album: "X&Y",
            AlbumArtUri: "https://link-to-album-art.com/coldplay_x_y.jpg"
        },
        {
            Artist: "Adele",
            Title: "Hello",
            Album: "25",
            AlbumArtUri: "https://link-to-album-art.com/adele_25.jpg"
        },
        {
            Artist: "Led Zeppelin",
            Title: "Stairway to Heaven",
            Album: "Led Zeppelin IV",
            AlbumArtUri: "https://link-to-album-art.com/led_zeppelin_iv.jpg"
        },
        {
            Artist: "Taylor Swift",
            Title: "Shake It Off",
            Album: "1989",
            AlbumArtUri: "https://link-to-album-art.com/taylor_swift_1989.jpg"
        },
        {
            Artist: "Post Malone",
            Title: "Circles",
            Album: "Hollywood's Bleeding",
            AlbumArtUri: "https://link-to-album-art.com/post_malone_hollywoods_bleeding.jpg"
        },
        {
            Artist: "Pink Floyd",
            Title: "Wish You Were Here",
            Album: "Wish You Were Here",
            AlbumArtUri: "https://link-to-album-art.com/pink_floyd_wish_you_were_here.jpg"
        },
        {
            Artist: "Ed Sheeran",
            Title: "Shape of You",
            Album: "Divide",
            AlbumArtUri: "https://link-to-album-art.com/ed_sheeran_divide.jpg"
        },
        {
            Artist: "The Rolling Stones",
            Title: "Paint It Black",
            Album: "Aftermath",
            AlbumArtUri: "https://link-to-album-art.com/rolling_stones_aftermath.jpg"
        },
        {
            Artist: "Queen",
            Title: "Bohemian Rhapsody",
            Album: "A Night at the Opera",
            AlbumArtUri: "https://link-to-album-art.com/queen_night_at_the_opera.jpg"
        },
        {
            Artist: "Michael Jackson",
            Title: "Billie Jean",
            Album: "Thriller",
            AlbumArtUri: "https://link-to-album-art.com/michael_jackson_thriller.jpg"
        },
        {
            Artist: "Beyoncé",
            Title: "Halo",
            Album: "I Am... Sasha Fierce",
            AlbumArtUri: "https://link-to-album-art.com/beyonce_sasha_fierce.jpg"
        },
        {
            Artist: "Drake",
            Title: "God's Plan",
            Album: "Scorpion",
            AlbumArtUri: "https://link-to-album-art.com/drake_scorpion.jpg"
        },
        {
            Artist: "The Killers",
            Title: "Mr. Brightside",
            Album: "Hot Fuss",
            AlbumArtUri: "https://link-to-album-art.com/killers_hot_fuss.jpg"
        },
        {
            Artist: "Frank Ocean",
            Title: "Thinkin Bout You",
            Album: "Channel Orange",
            AlbumArtUri: "https://link-to-album-art.com/frank_ocean_channel_orange.jpg"
        },
        {
            Artist: "Lana Del Rey",
            Title: "Summertime Sadness",
            Album: "Born to Die",
            AlbumArtUri: "https://link-to-album-art.com/lana_del_rey_born_to_die.jpg"
        }
    ];

    const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState(8);

    useEffect(() => {
        const onKeyPress = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                setCurrentlyPlayingIndex((prev) => prev - 1);
            } else if (e.key === "ArrowRight") {
                setCurrentlyPlayingIndex((prev) => prev + 1);
            }
        };

        window.addEventListener('keydown', onKeyPress);

        return () => {
            window.removeEventListener('keydown', onKeyPress);
        }
    }, []);


    return (
        <div>
            {
                fakeQueue.map((track, index) => (<TrackEntity key={index} entity={track} playing={currentlyPlayingIndex === index} />))
            }

        </div>
    );
}
