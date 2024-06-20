import React from "react";
import styled from "styled-components";
import axios from "axios";
import { reducerCases } from "../utils/constants";
import {
    BsFillPlayCircleFill,
    BsFillPauseCircleFill,
    BsShuffle,
} from "react-icons/bs";
import { CgPlayTrackNext, CgPlayTrackPrev } from "react-icons/cg";
import { FiRepeat } from "react-icons/fi";
import { useStateProvider } from "../utils/StateProvider";

export default function PlayerControls() {
    const [{ token, playerState }, dispatch] = useStateProvider();

    const changeState = async () => {
        const state = playerState ? "pause" : "play";
        try {
            await axios.put(`https://api.spotify.com/v1/me/player/${state}`, {}, {
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
            });
            dispatch({
                type: reducerCases.SET_PLAYER_STATE,
                playerState: !playerState,
            });
        } catch (error) {
            console.error('Error changing state:', error.response || error.message);
        }
    };

    const changeTrack = async (type) => {
        try {
            await axios.post(`https://api.spotify.com/v1/me/player/${type}`, {}, {
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
            });
            dispatch({
                type: reducerCases.SET_PLAYER_STATE,
                playerState: true
            });
            const response = await axios.get(
                "https://api.spotify.com/v1/me/player/currently-playing",
                {
                    headers: {
                        Authorization: "Bearer " + token,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.data !== "") {
                const { item } = response.data;
                const currentlyPlaying = {
                    id: item.id,
                    name: item.name,
                    artists: item.artists.map((artist) => artist.name),
                    image: item.album.images[2].url,
                };
                dispatch({ type: reducerCases.SET_PLAYING, currentlyPlaying });
            } else {
                dispatch({ type: reducerCases.SET_PLAYING, currentlyPlaying: null });
            }
        } catch (error) {
            console.error('Error changing track:', error.response || error.message);
        }
    };

    return (
        <Container>
            <div className="shuffle">
                <BsShuffle />
            </div>
            <div className="previous">
                <CgPlayTrackPrev onClick={() => changeTrack("previous")} />
            </div>
            <div className="state">
                {playerState ? (
                    <BsFillPauseCircleFill onClick={changeState} />
                ) : (
                    <BsFillPlayCircleFill onClick={changeState} />
                )}
            </div>
            <div className="next">
                <CgPlayTrackNext onClick={() => changeTrack("next")} />
            </div>
            <div className="repeat">
                <FiRepeat />
            </div>
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    svg {
        color: white;
        transition: 0.2s ease-in-out;
        &:hover {
            color: white;
        }
    }
    .state {
        svg {
            color: white;
        }
    }
    .previous, .next, .state {
        font-size: 2rem;
    }
`;