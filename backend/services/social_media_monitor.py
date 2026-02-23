# services/social_media_monitor.py

import snscrape.modules.twitter as sntwitter
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from fuzzywuzzy import fuzz
import datetime

keywords = [
"dengue Chennai","fever outbreak",
"hospital full","cough fever",
"காய்ச்சல்","டெங்கு"
]

analyzer = SentimentIntensityAnalyzer()

def collect_tweets():
    now = datetime.datetime.now()
    since = now - datetime.timedelta(hours=24)
    query = " OR ".join(keywords)

    tweets = []
    for t in sntwitter.TwitterSearchScraper(
        f"{query} since:{since.date()}").get_items():
        tweets.append(t.content)
        if len(tweets) >= 500: break
    return tweets

def compute_vigor(disease):
    tweets = collect_tweets()
    count = 0
    for tw in tweets:
        if fuzz.partial_ratio(disease, tw) >= 85:
            score = analyzer.polarity_scores(tw)['compound']
            if score > 0.5:
                count += 1
    vigor = min((count/50)*10,10)
    return {
        "disease": disease,
        "tweet_volume": count,
        "vigor_score": vigor
    }
    
    
if __name__ == "__main__":
    result = compute_vigor("dengue")
    print(result)