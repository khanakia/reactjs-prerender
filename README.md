## Prender Proxy - React Js App
React JS Client > Cloudflare > Proxy Server (Pupeeter) 

#### Few points to remeber
* Proxy will not work if you are trying to achieve this  (You want requests to go from the browser via **Cloudflare’s proxy** to your **Nginx proxy** and then on to your **internal server**.)
* You need to disable the proxy cloud on cloudflare for your Proxy A Records for e.g. in my case it was A - prerender.lucian.com - 11.22.33.343 (Proxy Icon Disabled)

## STEPS
* Create a prerender.lucian.com.conf in nginx > sites-avaiable
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
So now your server will be listening on http://127.0.0.1:3001

* You can test the prerendering using http://prerender.lucian.com?url=https://www.google.com

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
