/*
Songs from the API are stored in the SongInfo model. This model is used to store the song's information from backend:
package ch.uzh.ifi.hase.soprafs24.entity;
// SongInfo.java
public class SongInfo {
    private String title;
    private String artist;
    private String imageUrl;
    private String playUrl;

    // Constructor
    public SongInfo(String title, String artist, String imageUrl, String playUrl) {
        this.title = title;
        this.artist = artist;
        this.imageUrl = imageUrl;
        this.playUrl = playUrl;
    }

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getArtist() { return artist; }
    public void setArtist(String artist) { this.artist = artist; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getPlayUrl() { return playUrl; }
    public void setPlayUrl(String playUrl) { this.playUrl = playUrl; }
}

 */

class SongInfo {
  constructor(data = {}) {
    this.title = null;
    this.artist = null;
    this.imageUrl = null;
    this.playUrl = null;
    Object.assign(this, data);
  }
}