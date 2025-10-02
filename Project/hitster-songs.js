// Hitster songs database
// This contains popular songs that are likely in the original Hitster game
// Each song includes: artist, title, year, and Spotify track ID for preview
const hitsterSongs = [
    {
        artist: "Queen",
        title: "Bohemian Rhapsody",
        year: 1975,
        spotifyId: "4u7EnebtmKWzUH433cf5Qv"
    },
    {
        artist: "The Beatles",
        title: "Hey Jude",
        year: 1968,
        spotifyId: "0aym2LBJBk9DAYuHHutrIl"
    },
    {
        artist: "Michael Jackson",
        title: "Billie Jean",
        year: 1982,
        spotifyId: "5ChkMS8OtdzJeqyybCc9R5"
    },
    {
        artist: "Eagles",
        title: "Hotel California",
        year: 1976,
        spotifyId: "40riOy7x9W7GXjyGp4pjAv"
    },
    {
        artist: "Led Zeppelin",
        title: "Stairway to Heaven",
        year: 1971,
        spotifyId: "5CQ30WqJwcep0pYcV4AMNc"
    },
    {
        artist: "ABBA",
        title: "Dancing Queen",
        year: 1976,
        spotifyId: "0GjEhVFGZW8afUYGChu1Zr"
    },
    {
        artist: "Elton John",
        title: "Your Song",
        year: 1970,
        spotifyId: "3gdewACMIVMEWVbyb8O9sY"
    },
    {
        artist: "Pink Floyd",
        title: "Another Brick in the Wall",
        year: 1979,
        spotifyId: "1wKlnZuTXmMHLtbf4OXUWS"
    },
    {
        artist: "Fleetwood Mac",
        title: "Go Your Own Way",
        year: 1977,
        spotifyId: "0xKlzOAKOJnYcjNnZQFE1q"
    },
    {
        artist: "The Rolling Stones",
        title: "Paint It Black",
        year: 1966,
        spotifyId: "6HSXNV0b4M4xP47xBn6Znf"
    },
    {
        artist: "Nirvana",
        title: "Smells Like Teen Spirit",
        year: 1991,
        spotifyId: "5ghIJDpPoe3CfHMGu71E6T"
    },
    {
        artist: "Whitney Houston",
        title: "I Will Always Love You",
        year: 1992,
        spotifyId: "4eHbdreAnSOrDDsFfc4Fpm"
    },
    {
        artist: "Bon Jovi",
        title: "Livin' on a Prayer",
        year: 1986,
        spotifyId: "37ZJ0p5Jm13JPevGcx4SkF"
    },
    {
        artist: "U2",
        title: "With or Without You",
        year: 1987,
        spotifyId: "6ADSCnNOOtVps0z5mmb7ku"
    },
    {
        artist: "Madonna",
        title: "Like a Virgin",
        year: 1984,
        spotifyId: "1nMF3QgvKljGUlKa5eYJvP"
    },
    {
        artist: "David Bowie",
        title: "Heroes",
        year: 1977,
        spotifyId: "7Jh1bpe76CNTCgdgAdBw4Z"
    },
    {
        artist: "Prince",
        title: "Purple Rain",
        year: 1984,
        spotifyId: "4BJqT0PrAfrxzMOxytFOIz"
    },
    {
        artist: "Guns N' Roses",
        title: "Sweet Child O' Mine",
        year: 1987,
        spotifyId: "7o2CTH4ctstm8TNelqjb51"
    },
    {
        artist: "AC/DC",
        title: "Back in Black",
        year: 1980,
        spotifyId: "08mG3Y1vljYA6bvDt4Wqkj"
    },
    {
        artist: "The Police",
        title: "Every Breath You Take",
        year: 1983,
        spotifyId: "1JSTJqkT5qHq8MDJnJbRE1"
    },
    {
        artist: "Toto",
        title: "Africa",
        year: 1982,
        spotifyId: "2374M0fQpWi3dLnB54qaLX"
    },
    {
        artist: "Journey",
        title: "Don't Stop Believin'",
        year: 1981,
        spotifyId: "4bHsxqR3GMrXTxEPLuK5ue"
    },
    {
        artist: "Phil Collins",
        title: "In the Air Tonight",
        year: 1981,
        spotifyId: "18AXbzPzBS8Y3AkgSxzJPb"
    },
    {
        artist: "George Michael",
        title: "Careless Whisper",
        year: 1984,
        spotifyId: "1mXVgsBdtIVeCLJnSnmtdV"
    },
    {
        artist: "Cyndi Lauper",
        title: "Time After Time",
        year: 1983,
        spotifyId: "2tNEcBOABqhmhVJgx8XyLw"
    },
    {
        artist: "Alanis Morissette",
        title: "You Oughta Know",
        year: 1995,
        spotifyId: "6nrktAxhKgBfNMrHlpO95Y"
    },
    {
        artist: "R.E.M.",
        title: "Losing My Religion",
        year: 1991,
        spotifyId: "12G0m3WCPSvSWg2hTTNNag"
    },
    {
        artist: "Radiohead",
        title: "Creep",
        year: 1992,
        spotifyId: "70LcF31zb1H0PyJoS1Sx1r"
    },
    {
        artist: "Oasis",
        title: "Wonderwall",
        year: 1995,
        spotifyId: "4Dvkj6JhhA12EX05fT7y2e"
    },
    {
        artist: "The Verve",
        title: "Bitter Sweet Symphony",
        year: 1997,
        spotifyId: "57bgtoPSgt236HzfBOd8kj"
    },
    {
        artist: "Backstreet Boys",
        title: "I Want It That Way",
        year: 1999,
        spotifyId: "47BBI51FKFwOMlIiX6m8ya"
    },
    {
        artist: "Britney Spears",
        title: "...Baby One More Time",
        year: 1998,
        spotifyId: "3MjUtNVVq3C8Fn0MP3zhXa"
    },
    {
        artist: "Eminem",
        title: "Lose Yourself",
        year: 2002,
        spotifyId: "7w87IxuO7BDcJ3YUqCyMTT"
    },
    {
        artist: "Outkast",
        title: "Hey Ya!",
        year: 2003,
        spotifyId: "6XpldHhwbPHtjIcggCl8IP"
    },
    {
        artist: "50 Cent",
        title: "In da Club",
        year: 2003,
        spotifyId: "7iL0uRLo5IGgEgKzdkUtmL"
    },
    {
        artist: "Coldplay",
        title: "Yellow",
        year: 2000,
        spotifyId: "3AJwUDP919kvQ9QcozQPxg"
    },
    {
        artist: "Red Hot Chili Peppers",
        title: "Californication",
        year: 1999,
        spotifyId: "48UPSzbZjgc449aqz8bxox"
    },
    {
        artist: "Linkin Park",
        title: "In the End",
        year: 2000,
        spotifyId: "60a0Rd6pjrkxjPbaKzXjfq"
    },
    {
        artist: "Green Day",
        title: "Basket Case",
        year: 1994,
        spotifyId: "6L89mwZXSOwYl76YXfX13s"
    },
    {
        artist: "The White Stripes",
        title: "Seven Nation Army",
        year: 2003,
        spotifyId: "3dPQuX8Gs42Y7b454sMSBX"
    },
    {
        artist: "Amy Winehouse",
        title: "Rehab",
        year: 2006,
        spotifyId: "7EgWNv78gLsV4qGG0KfcYg"
    },
    {
        artist: "Adele",
        title: "Rolling in the Deep",
        year: 2010,
        spotifyId: "2Fxmhks0bxGSBdJ92vM42m"
    },
    {
        artist: "Bruno Mars",
        title: "Uptown Funk",
        year: 2014,
        spotifyId: "32OlwWuMpZ6b0aN2RZOeMS"
    },
    {
        artist: "Ed Sheeran",
        title: "Shape of You",
        year: 2017,
        spotifyId: "7qiZfU4dY1lWllzX7mPBI3"
    },
    {
        artist: "The Weeknd",
        title: "Blinding Lights",
        year: 2019,
        spotifyId: "0VjIjW4GlUZAMYd2vXMi3b"
    },
    {
        artist: "Dua Lipa",
        title: "Don't Start Now",
        year: 2019,
        spotifyId: "6WrI0LAC5M1Rw2MnX2ZvEg"
    },
    {
        artist: "Billie Eilish",
        title: "bad guy",
        year: 2019,
        spotifyId: "2Fxmhks0bxGSBdJ92vM42m"
    },
    {
        artist: "Lady Gaga",
        title: "Bad Romance",
        year: 2009,
        spotifyId: "0SiywuOBRcynK0uKGWdCnn"
    },
    {
        artist: "Rihanna",
        title: "Umbrella",
        year: 2007,
        spotifyId: "49FYlytm3dAAraYgpoJZux"
    },
    {
        artist: "Justin Timberlake",
        title: "SexyBack",
        year: 2006,
        spotifyId: "1mfVZvzcgkby2nfQlMlc9I"
    },
    {
        artist: "Beyoncé",
        title: "Crazy in Love",
        year: 2003,
        spotifyId: "5IVuqXILoxVWvWEPm82Jxr"
    }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = hitsterSongs;
}