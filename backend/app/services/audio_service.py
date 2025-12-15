"""
Audio processing service using FFmpeg
"""

from pathlib import Path
from typing import Any

import ffmpeg
from mutagen import File as MutagenFile
from mutagen.id3 import ID3NoHeaderError

from app.models.audio import AudioMetadataResponse, AudioProcessingResponse
from app.utils.file_handler import calculate_compression_ratio, get_file_size


def convert_audio(
    input_path: Path,
    output_path: Path,
    output_format: str = "mp3",
    quality: str = "medium",
    bitrate: str = "192k",
) -> AudioProcessingResponse:
    """
    Convert an audio file to a different format using FFmpeg

    Args:
        input_path: Path to input audio file
        output_path: Path to save converted audio
        output_format: Output audio format (mp3, wav, flac, ogg, aac, m4a)
        quality: Conversion quality preset (low, medium, high)
        bitrate: Audio bitrate (e.g., 128k, 192k, 256k, 320k)

    Returns:
        AudioProcessingResponse with conversion results
    """
    try:
        original_size = get_file_size(input_path)

        # Map codecs per format
        codec_map = {
            "mp3": "libmp3lame",
            "wav": "pcm_s16le",
            "flac": "flac",
            "ogg": "libvorbis",
            "aac": "aac",
            "m4a": "aac",
        }

        codec = codec_map.get(output_format.lower())
        if codec is None:
            return AudioProcessingResponse(
                success=False,
                message=f"Unsupported output audio format: {output_format}",
                filename=output_path.name if output_path else None,
            )

        # Build FFmpeg input
        stream = ffmpeg.input(str(input_path))

        # Build output options
        output_kwargs = {"acodec": codec}

        # Set bitrate for lossy formats
        if output_format.lower() in ["mp3", "ogg", "aac", "m4a"]:
            output_kwargs["b:a"] = bitrate

        # For WAV and FLAC, we can set sample rate based on quality
        if output_format.lower() in ["wav", "flac"]:
            quality_sample_rates = {
                "low": "22050",
                "medium": "44100",
                "high": "48000",
            }
            sample_rate = quality_sample_rates.get(quality, "44100")
            output_kwargs["ar"] = sample_rate

        # For MP3, adjust quality based on preset
        if output_format.lower() == "mp3":
            quality_presets = {
                "low": "7",  # Lower quality, smaller file
                "medium": "4",  # Medium quality
                "high": "0",  # High quality, larger file
            }
            output_kwargs["q:a"] = quality_presets.get(quality, "4")

        # Run FFmpeg conversion
        stream = ffmpeg.output(stream, str(output_path), **output_kwargs)
        ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)

        # Get converted file size
        processed_size = get_file_size(output_path)
        compression_ratio = calculate_compression_ratio(original_size, processed_size)

        return AudioProcessingResponse(
            success=True,
            message=f"Audio converted to {output_format.upper()} successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=original_size,
            processed_size=processed_size,
            compression_ratio=compression_ratio,
        )

    except ffmpeg.Error as e:
        error_message = e.stderr.decode() if e.stderr else str(e)
        return AudioProcessingResponse(
            success=False,
            message=f"FFmpeg error: {error_message}",
            filename=output_path.name if output_path else None,
        )

    except Exception as e:
        return AudioProcessingResponse(
            success=False,
            message=f"Error converting audio: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def compress_audio(
    input_path: Path,
    output_path: Path,
    quality: str = "medium",
    target_bitrate: str = "128k",
) -> AudioProcessingResponse:
    """
    Compress an audio file to reduce its size using FFmpeg

    Args:
        input_path: Path to input audio file
        output_path: Path to save compressed audio
        quality: Compression quality preset (low, medium, high)
        target_bitrate: Target audio bitrate (e.g., 64k, 96k, 128k, 160k, 192k)

    Returns:
        AudioProcessingResponse with compression results
    """
    try:
        original_size = get_file_size(input_path)

        # Detect input format
        input_ext = input_path.suffix.lower()

        # Determine output format based on input
        # For lossless formats (WAV, FLAC), convert to MP3 for compression
        # For lossy formats, keep the same format but reduce bitrate
        if input_ext in [".wav", ".flac"]:
            output_format = "mp3"
            codec = "libmp3lame"
        elif input_ext in [".mp3"]:
            output_format = "mp3"
            codec = "libmp3lame"
        elif input_ext in [".ogg"]:
            output_format = "ogg"
            codec = "libvorbis"
        elif input_ext in [".aac", ".m4a"]:
            output_format = "aac"
            codec = "aac"
        else:
            # Default to MP3 for unknown formats
            output_format = "mp3"
            codec = "libmp3lame"

        # Build FFmpeg input
        stream = ffmpeg.input(str(input_path))

        # Build output options for compression
        output_kwargs = {"acodec": codec}

        # Set bitrate based on quality preset if target_bitrate not explicitly set
        quality_bitrates = {
            "low": "96k",
            "medium": "128k",
            "high": "192k",
        }

        # Use target_bitrate if provided, otherwise use quality preset
        final_bitrate = target_bitrate if target_bitrate else quality_bitrates.get(quality, "128k")
        output_kwargs["b:a"] = final_bitrate

        # For MP3, adjust quality preset for better compression
        if output_format == "mp3":
            quality_presets = {
                "low": "7",  # Lower quality, smaller file
                "medium": "5",  # Medium quality
                "high": "3",  # Higher quality
            }
            output_kwargs["q:a"] = quality_presets.get(quality, "5")

        # Run FFmpeg compression
        stream = ffmpeg.output(stream, str(output_path), **output_kwargs)
        ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)

        # Get compressed file size
        processed_size = get_file_size(output_path)
        compression_ratio = calculate_compression_ratio(original_size, processed_size)

        return AudioProcessingResponse(
            success=True,
            message=f"Audio compressed successfully (bitrate: {final_bitrate})",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=original_size,
            processed_size=processed_size,
            compression_ratio=compression_ratio,
        )

    except ffmpeg.Error as e:
        error_message = e.stderr.decode() if e.stderr else str(e)
        return AudioProcessingResponse(
            success=False,
            message=f"FFmpeg error: {error_message}",
            filename=output_path.name if output_path else None,
        )

    except Exception as e:
        return AudioProcessingResponse(
            success=False,
            message=f"Error compressing audio: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def merge_audio(
    input_paths: list[Path],
    output_path: Path,
    output_format: str = "mp3",
    quality: str = "medium",
    bitrate: str = "192k",
) -> AudioProcessingResponse:
    """
    Merge multiple audio files into one using FFmpeg concat demuxer

    Args:
        input_paths: List of paths to input audio files (in order)
        output_path: Path to save merged audio
        output_format: Output audio format (mp3, wav, flac, ogg, aac, m4a)
        quality: Output quality preset (low, medium, high)
        bitrate: Audio bitrate (e.g., 128k, 192k, 256k, 320k)

    Returns:
        AudioProcessingResponse with merge results
    """
    try:
        if len(input_paths) < 2:
            return AudioProcessingResponse(
                success=False,
                message="At least 2 audio files are required for merging",
                filename=output_path.name if output_path else None,
            )

        # Calculate total original size
        total_original_size = sum(get_file_size(path) for path in input_paths)

        # Map codecs per format
        codec_map = {
            "mp3": "libmp3lame",
            "wav": "pcm_s16le",
            "flac": "flac",
            "ogg": "libvorbis",
            "aac": "aac",
            "m4a": "aac",
        }

        codec = codec_map.get(output_format.lower())
        if codec is None:
            return AudioProcessingResponse(
                success=False,
                message=f"Unsupported output audio format: {output_format}",
                filename=output_path.name if output_path else None,
            )

        # Use concat filter instead of concat demuxer for better compatibility
        # This method works even when files have different codecs/sample rates
        # The filter normalizes all inputs before concatenating
        # Create input streams for all audio files
        input_streams = [ffmpeg.input(str(path)) for path in input_paths]

        # Extract audio streams (in case some files have video tracks)
        # Use ['a'] to get the first audio stream from each input
        audio_streams = [stream["a"] for stream in input_streams]

        # Use concat filter to merge audio streams
        # The concat filter requires all streams to be passed as a list
        # n=number of inputs, v=0 (no video), a=1 (audio only)
        # This syntax is similar to how paletteuse filter works in video_service.py
        merged_stream = ffmpeg.filter(audio_streams, "concat", n=len(input_paths), v=0, a=1)

        # Build output options
        output_kwargs = {"acodec": codec}

        # Set bitrate for lossy formats
        if output_format.lower() in ["mp3", "ogg", "aac", "m4a"]:
            output_kwargs["b:a"] = bitrate

        # For WAV and FLAC, set sample rate based on quality
        if output_format.lower() in ["wav", "flac"]:
            quality_sample_rates = {
                "low": "22050",
                "medium": "44100",
                "high": "48000",
            }
            sample_rate = quality_sample_rates.get(quality, "44100")
            output_kwargs["ar"] = sample_rate

        # For MP3, adjust quality based on preset
        if output_format.lower() == "mp3":
            quality_presets = {
                "low": "7",
                "medium": "4",
                "high": "0",
            }
            output_kwargs["q:a"] = quality_presets.get(quality, "4")

        stream = ffmpeg.output(merged_stream, str(output_path), **output_kwargs)
        ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)

        # Get merged file size
        merged_size = get_file_size(output_path)
        compression_ratio = calculate_compression_ratio(total_original_size, merged_size)

        return AudioProcessingResponse(
            success=True,
            message=f"Successfully merged {len(input_paths)} audio files",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=total_original_size,
            processed_size=merged_size,
            compression_ratio=compression_ratio,
        )

    except ffmpeg.Error as e:
        error_message = e.stderr.decode() if e.stderr else str(e)
        return AudioProcessingResponse(
            success=False,
            message=f"FFmpeg error: {error_message}",
            filename=output_path.name if output_path else None,
        )

    except Exception as e:
        return AudioProcessingResponse(
            success=False,
            message=f"Error merging audio: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def extract_audio_metadata(input_path: Path) -> AudioMetadataResponse:
    """
    Extract metadata from an audio file using mutagen and ffprobe

    Args:
        input_path: Path to input audio file

    Returns:
        AudioMetadataResponse with extracted metadata
    """
    try:
        metadata: dict[str, Any] = {}

        # Get file size
        file_size = get_file_size(input_path)
        metadata["file_size"] = file_size
        metadata["file_size_mb"] = round(file_size / (1024 * 1024), 2)

        # Use ffprobe to get technical information
        try:
            probe = ffmpeg.probe(str(input_path))
            audio_stream = next(
                (
                    stream
                    for stream in probe.get("streams", [])
                    if stream.get("codec_type") == "audio"
                ),
                None,
            )

            if audio_stream:
                # Duration
                duration = float(audio_stream.get("duration", 0))
                metadata["duration"] = round(duration, 2)
                metadata["duration_formatted"] = format_duration(duration)

                # Bitrate
                bitrate = audio_stream.get("bit_rate")
                if bitrate:
                    bitrate_kbps = int(bitrate) // 1000
                    metadata["bitrate"] = bitrate_kbps
                    metadata["bitrate_formatted"] = f"{bitrate_kbps} kbps"

                # Sample rate
                sample_rate = audio_stream.get("sample_rate")
                if sample_rate:
                    metadata["sample_rate"] = int(sample_rate)
                    metadata["sample_rate_formatted"] = f"{int(sample_rate)} Hz"

                # Channels
                channels = audio_stream.get("channels")
                if channels:
                    metadata["channels"] = channels
                    metadata["channels_formatted"] = (
                        f"{channels} {'channel' if channels == 1 else 'channels'}"
                    )

                # Codec
                codec = audio_stream.get("codec_name")
                if codec:
                    metadata["codec"] = codec

                # Format
                format_name = probe.get("format", {}).get("format_name", "")
                if format_name:
                    metadata["format"] = format_name.split(",")[0]  # Get first format
        except Exception as e:
            # If ffprobe fails, continue with mutagen metadata only
            pass

        # Use mutagen to get ID3 tags and other metadata
        try:
            audio_file = MutagenFile(str(input_path))

            if audio_file is not None:
                # Common tags
                tag_mapping = {
                    "TIT2": "title",  # ID3v2.3/2.4
                    "TALB": "album",
                    "TPE1": "artist",
                    "TPE2": "album_artist",
                    "TDRC": "date",
                    "TRCK": "track",
                    "TCON": "genre",
                    "COMM": "comment",
                    "TCOM": "composer",
                    "TPUB": "publisher",
                    "TCOP": "copyright",
                }

                # Try to get tags
                for tag_key, metadata_key in tag_mapping.items():
                    try:
                        if hasattr(audio_file, "get"):
                            value = audio_file.get(tag_key)
                            if value:
                                if isinstance(value, list) and len(value) > 0:
                                    metadata[metadata_key] = str(value[0])
                                elif value:
                                    metadata[metadata_key] = str(value)
                    except (KeyError, AttributeError):
                        pass

                # Try common mutagen properties
                common_props = {
                    "title": ["TIT2", "TITLE"],
                    "artist": ["TPE1", "ARTIST"],
                    "album": ["TALB", "ALBUM"],
                    "date": ["TDRC", "DATE", "TDRL"],
                    "genre": ["TCON", "GENRE"],
                    "track": ["TRCK", "TRACKNUMBER"],
                    "comment": ["COMM", "COMMENT"],
                }

                for prop_key, tag_keys in common_props.items():
                    if prop_key not in metadata:
                        for tag_key in tag_keys:
                            try:
                                if hasattr(audio_file, tag_key):
                                    value = getattr(audio_file, tag_key)
                                    if value:
                                        if isinstance(value, list) and len(value) > 0:
                                            metadata[prop_key] = str(value[0])
                                        else:
                                            metadata[prop_key] = str(value)
                                        break
                            except (KeyError, AttributeError):
                                continue

                # Get length from mutagen if not already set
                if "duration" not in metadata and hasattr(audio_file, "info"):
                    try:
                        length = audio_file.info.length
                        if length:
                            metadata["duration"] = round(length, 2)
                            metadata["duration_formatted"] = format_duration(length)
                    except (AttributeError, TypeError):
                        pass

                # Get bitrate from mutagen if not already set
                if "bitrate" not in metadata and hasattr(audio_file, "info"):
                    try:
                        bitrate = audio_file.info.bitrate
                        if bitrate:
                            metadata["bitrate"] = bitrate // 1000
                            metadata["bitrate_formatted"] = f"{bitrate // 1000} kbps"
                    except (AttributeError, TypeError):
                        pass

        except ID3NoHeaderError:
            # File has no ID3 tags, that's okay
            pass
        except Exception as e:
            # If mutagen fails, continue with ffprobe data only
            pass

        return AudioMetadataResponse(
            success=True,
            message="Metadata extracted successfully",
            filename=input_path.name,
            metadata=metadata,
        )

    except Exception as e:
        return AudioMetadataResponse(
            success=False,
            message=f"Error extracting metadata: {str(e)}",
            filename=input_path.name if input_path else "",
            metadata={},
        )


def format_duration(seconds: float) -> str:
    """
    Format duration in seconds to human-readable string (MM:SS or HH:MM:SS)

    Args:
        seconds: Duration in seconds

    Returns:
        Formatted duration string
    """
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)

    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    else:
        return f"{minutes:02d}:{secs:02d}"
