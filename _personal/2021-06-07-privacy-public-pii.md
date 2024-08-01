---
layout: post
title: Your public "private" info and how to remove (most) of it
description: Your "private" personal information is publicly available online and you probably didn't know it.
date: 2021-06-07 20:00:00 -0700
tag: Internet-Privacy
comment_issue_id: 17
---

> **Disclaimer**: This is not legal advice, I'm not a legal professional, this information is just my opinion and my interpretation of research I have done. Some of it may not be accurate or may be plain wrong. Use this information at your own risk. I am not responsible for any damages to you, your computer, etc.

---

[**tl;dr** - This post ended up being longer than expected...if you just want to jump to the important bits, then click here.](#the-whole-point-of-this-post)

My blog posts are normally targeted at software developers, nerds, technical professionals, etc. So this post is going to be a bit different from my norm. This post is also targeted to those who live in the United States, outside of the US there are different laws and security practices, such as GDPR. I am nowhere near an expert on GDPR, so I won't even begin to try and cover that.

Internet privacy is nearly impossible these days. Even the least tech-savvy people can quickly find personal info about you online with just a few Google searches; home address, phone numbers, pictures, where you work, who you're dating, family members, social media profiles...all of this can be found, for most people, just by knowing the right websites to use.

Unless you move to a cabin in the woods and live off the land, even that might not help you these days. However, there are quite a few things you can do that are relatively simple to clean up the easy to find stuff.

This is the first post in a possible series I might write about regarding internet privacy. I am by no means an expert, I'm just your average software developer. But I do know a few tricks I'd like to teach you.

---

### What is  "PII"?

You may have heard this term before. What is it? PII is "Personally Identifiable Information". This is any information that can be used to identify YOU, not just people *like* you, or people who live near you, but you specifically. PII on its own is a pretty broad category...depending on the context, it could range from a zip code to a credit card number to health/financial records to a social security number.

Depending on the sensitivity of this data, companies are supposed to be encrypting the storage and transfer of this data. There's all sorts of security practices around handling PII.

The information I'm going to focus in this post is:

* Home Address (and previous addresses)
* Phone numbers
* Age / date of birth
* Email address
* Relatives / Known associates

This is information that is most commonly returned by "people finder" type sites.

---

### Let's do a test

Using information the average person would likely be able to figure out just by looking at a public Facebook profile...name, current state and a rough estimation of age, let's see how much information we can find on you, just by using one website.

[truepeoplesearch.com](https://www.truepeoplesearch.com/){:target="_blank"} is one of many people finder / people search sites and is probably one of the most popular ones. If you're viewing this post in the future and that site no longer exists...There are plenty of other sites out there with very similar search processes that I'm about to explain.

**Before doing anything**, I want to note...MANY of these sites suck you into paying for their services, or will link you to shady sites. **DO NOT** download anything, **DO NOT** pay for anything, **DO NOT** provide any personal information. If you run a search or you try to open your record to view more details and they start "running a scan", then close the tab...those sites always ask for you to pay, or lead you to a shady website.

Let's continue with our test using True People Search:

1. Fill in your name (for me, I would use my first name and last name). If you have one or more middle names, just leave those out, the less specific the better in this case (some of these sites aren't always able to get your full name).
2. Type in your state, not your city or zip code.
3. Hit search.
4. At the top, use the age filter to narrow down your search to an age range of about +/- 3-5 years. If you're 30, use something like 25-35.

There's a good chance you will find your record within the first few pages. If not, that doesn't mean it's not there or that they don't have your info, it just means you didn't find it. Now click on "View Details" and look at how much information they have on you, publicly available for anyone to use how they please. Some of it might not be up to date, some of it might be completely wrong, that's because these sites are trying to piece together information that they think is related.

Maybe there's a previous address in there you don't recognize...it could be an address your sibling or parents use to live.

There are TONS of websites like these, and you will never find them all. This post is going to show you what rights you have and how to remove or hide this information from many of these sites.

---

### Your rights

Just to reiterate...please read the disclaimer at the top of this post. This is a very loose interpretation and summary of what I've gleaned from my research.

I'm not going to get into the individual laws/acts that cover this. There are things like the Privacy Act of 1974, HIPAA, CCPA, CPRA, FCRA, and many more acronyms. Not to mention individual state laws and regulations. There's too much to cover, and I don't know what half of it means anyway.

What I can say is this...any site that stores your personal information and you would like it to be removed or hidden from public view; scroll to the bottom of that website and look for things like "Do not sell my personal information", "Do not sell my info", "Do not sell". If you don't see that, then look for "Privacy Policy" which will hopefully contain something similar. These links will usually take you to an opt-out form where you can request to have your information hidden or completely deleted.

---

### California and CCPA

The California Consumer Privacy Act. This is a whole monster on its own...to be honest I still don't understand the full scope of it and all the details. There are a plethora of multi-part blog series all over the internet. [Here's one I found while researching for this post](https://www.fieldfisher.com/en/services/privacy-security-and-information/privacy-security-and-information-law-blog//ccpa-blog-series-part-1-we-just-got-through-gdpr-here-we-go-again){:target="_blank"}. It's not a simple thing to cover.

Basically it means that if a business matches a certain set of criteria (revenue, amount of data stored, etc), then they must abide by additional requirements for handling PII and provide certain options to California residents.

As a California resident, you have a basic set of rights provided by the CCPA, for the purposes of this blog post, these are the ones that I think that apply...and what I think they summarize to mean.

* Right to opt-out - "stop selling my information"
* Right to deletion - "delete any personal information of mine that you currently have"
  * There are a few exceptions to this where they don't have to delete any or some of the data.
* Right to disclosure - "what personal information of mine do you have, and how do you use it?"

---

### The whole point of this post

If all you care about is the tl;dr...then this is where you should start.

There are websites out there that publicly display your address and phone numbers and stuff. Here's some of those sites, and how to "remove" your info. If you live in California, you have additional options.

This is a list I uploaded to GitHub which has some of the more popular sites that store and display private information publicly. It also contains links directly to their opt-out forms, as well as a CCPA link.

<https://github.com/chadbaldwin/internet-privacy/blob/main/sites.csv>{:target="_blank"}

If you don't live in California, I don't know what the laws are around whether you can use the CCPA links. That's your call if you choose to use them.

Each site will have its own opt-out process. Some will require you to email them, others will require you to search for your record and click an opt-out link. Others will ask you to find the URL to your record and submit that with the form. I won't walk you through any of these, if you need help, I recommend finding a friend or family member who is tech-savvy to help walk you through this.

Apologies to all cousins, niblings and siblings who will be getting a Facebook DM from their non-technical family member reading this post.

---

### Final words

Internet privacy is tough. Even after opting out of these sites or requesting it be deleted...They may gather new information about you immediately after. There will be hundreds of other websites that have this info as well. It is a never-ending battle.

If you found this post to be helpful, feel free to let me know in the comments, or email me. If you would like to contribute to the list, you're welcome to do so in the comments, by email or by submitting a pull request on GitHub.

I have other internet privacy topics I'd like to write about in the future, so I hope you check in from time to time, or follow my twitter where I'll tweet links to my latest blog posts.
