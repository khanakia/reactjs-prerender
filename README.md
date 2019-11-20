## React Server Side Rendering with Puppeteer if googlebot, yahoobot detected.
React JS Client > Cloudflare > Proxy Server (Pupeeter) 

This script is intend to render the react server side but using Pre-Rendering technique and it will prerender only if it detects the googlebot, yahoobot or bing.
Before we used to have React SSR on server side but as our code grows the issues also started to grow which made me rethink to alternative strategy to render the APP server side as i needed the SSR only for SEO so google and other search engines can crawl my site and have good SEO ranking. So here's the solution.

#### Required Skills
* You know how to configure Nginx
* You have knowledge how to host node.js app using NGINX

#### Few points to remeber
* Proxy will not work if you are trying to achieve this  (You want requests to go from the browser via **Cloudflare’s proxy** to your **Nginx proxy** and then on to your **internal server**.)
* You need to disable the proxy cloud on cloudflare for your Proxy A Records for e.g. in my case it was A - prerender.lucian.com - 11.22.33.343 (Proxy Icon Disabled)

####  Use Case
* We have 2 servers SERVER A and SERVER B
* SERVER A hosts the React JS app as plain HTML
* SERVER B will be the proxy server

## STEPS
* Create a NGINX conf file /etc/nginx/sites-available/prerender.lucian.com.conf 
	```
	server {
	    listen 80;
	    server_name prerender.lucian.com www.prerender.lucian.com;

	    location / {
	        proxy_pass http://127.0.0.1:3001;
	        proxy_http_version 1.1;
	        proxy_set_header Upgrade $http_upgrade;
	        proxy_set_header Connection 'upgrade';
	        proxy_set_header Host $host;
	        proxy_cache_bypass $http_upgrade;
	    }
	}
	```

* Clone the node.js app and start node server.js
```
git clone https://github.com/khanakia/reactjs-prerender.git
cd reactjs-prerender
yarn
node server.js
```
Note: To debug you can use this command **env DEBUG="puppeteer:*" node script.js**

If you get **CHROME** related library missing etc. errors you can check these 2 links
* https://blog.softhints.com/ubuntu-16-04-server-install-headless-google-chrome/
https://github.com/GoogleChrome/puppeteer/issues/3443
* https://blog.softhints.com/ubuntu-16-04-server-install-headless-google-chrome/
https://github.com/GoogleChrome/puppeteer/issues/3443

Note: You can use forever or pm2 to run your script as background process

* So now your server will be listening on http://127.0.0.1:3001
 You can test the prerendering using http://prerender.lucian.com?url=https://www.google.com

* If everything works fine then login in to your React JS Server and modify the config file accordingly

	```
	server {
	     listen 80;
	     server_name reactjsapp.com www.reactjsapp.com;
	     return 301 https://reactjsapp.com$request_uri;
	}
	server {
	    listen 443;

	    ssl on;
	    ssl_certificate      /etc/nginx/ssl/cloudflare.crt;
	    ssl_certificate_key  /etc/nginx/ssl/cloudflare.key;
	    
	    server_name reactjsapp.com www.reactjsapp.com;
	    
	    root /home/reactjsapp/html;
	    index index.html index.htm;

		location ~ /\. {
	        deny all;
	    }

	    location / {
	        try_files $uri @prerender;
	    }

	    location @prerender {
	        #proxy_set_header X-Prerender-Token YOUR_TOKEN;

	        set $prerender 0;
	        if ($http_user_agent ~* "googlebot|yahoo|bingbot|baiduspider|yandex|yeti|yodaobot|gigabot|ia_archiver|facebookexternalhit|twitterbot|developers\.google\.com") {
	            set $prerender 1;
	        }
	        if ($args ~ "_escaped_fragment_|prerender=1") {
	            set $prerender 1;
	        }
	        if ($http_user_agent ~ "Prerender") {
	            set $prerender 0;
	        }

	        if ($prerender = 1) {
	            rewrite .* /?url=$scheme://$host$request_uri? break;
	            proxy_pass http://prerender.lucian.com;
	        }

	        if ($prerender = 0) {
	            rewrite .* /index.html break;
	        }
	    }
	}
	```

* Now run your app in web browser https://reactjsapp.com and check view source you will see no html pre-rendered.

* Now fetch the application as GOOGLE BOT using curl command in terminal
	```
	curl --user-agent "Googlebot/2.1 (+http://www.google.com/bot.html)" -v https://reactjsapp.com/
	```
You will see whole HTML pre-rendered. Hula !!!!
