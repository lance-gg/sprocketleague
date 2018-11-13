#!/bin/bash
source /home/ec2-user/.bash_profile
mkdir -p /var/games/sprocketleague
cd /var/games/sprocketleague
npm install

# upload static files to s3
cd /var/games/sprocketleague/dist && aws s3 sync --acl public-read --delete . s3://sleague.lance.gg

# invalidate CDN
aws configure set preview.cloudfront true && aws cloudfront create-invalidation --distribution-id EDAST5EHQBDUW --paths "/*"
