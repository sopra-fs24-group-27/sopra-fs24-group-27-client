import React from "react";
import PropTypes from "prop-types"; // 导入 PropTypes
import { IconButton } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";

// 定义组件的属性类型
interface AudioPlayerProps {
  src: string; // 必需属性
  title?: string; // 可选属性
  artist?: string; // 可选属性
}

// 定义组件的状态类型
interface AudioPlayerState {
  playing: boolean; // 状态属性
}

class AudioPlayer extends React.Component<AudioPlayerProps, AudioPlayerState> {
  audioRef: React.RefObject<HTMLAudioElement>; // 定义引用

  constructor(props: AudioPlayerProps) {
    super(props);

    // 初始化引用和状态
    this.audioRef = React.createRef();
    this.state = {
      playing: false,
    };
  }

  // 定义播放/暂停切换函数
  togglePlayPause = () => {
    const audio = this.audioRef.current;

    if (audio?.paused) {
      audio.play();
      this.setState({ playing: true });
    } else if (audio) {
      audio.pause();
      this.setState({ playing: false });
    }
  };

  // 渲染组件
  render() {
    const { src, title, artist } = this.props;
    const { playing } = this.state;

    return (
      <div className="audio-player">
        <div className="audio-info">
          <span className="audio-title">{title}</span>
          <span className="audio-artist">{artist}</span>
        </div>

        <div className="audio-controls">
          <IconButton onClick={this.togglePlayPause}>
            {playing ? <Pause /> : <PlayArrow />}
          </IconButton>
        </div>

        <audio ref={this.audioRef} src={src} />
      </div>
    );
  }

  // 设置 propTypes 为静态属性
  static propTypes = {
    src: PropTypes.string.isRequired,
    title: PropTypes.string,
    artist: PropTypes.string,
  };
}

export default AudioPlayer; // 导出组件
