# Crawling tests

In order to test crawling capabilities, we create a docker container where runs a server.
This server has special /etc/hosts and /etc/host.conf files... or not... it uses --add-host, 'cause that's how things work in Docker 1.5. See https://github.com/docker/docker/issues/10324

Start the server and then run the tests in the machine

## Plan

A docker container runs a virtual web. Test are run inside this container.
dockerfile needs to be top level to see the crawl code (will simplify the virtual web app anyway)

## Tests

1) no url
    => (0, 0) graph

2) one valid url
    => (1, 0) graph
    
3) one URL that 404s
    => (0, 0) graph

4) /1 --301--> /2
    => (1, 0) graph with /2

5) /1 --301--> /2 --301--> /3
    => (1, 0) graph with /3

6) 2 URLs
    => (2, 0) graph

7) /1 -> /2 graph
    => (2, 1)
    
8) /1 <-> /2 graph
    => (2, 2)
    
9) /1 -> /2 --301--> /3
    => (2, 1) graph (the second node is /3)

10) /1 -> /2 , /1 -> /3
    => (3, 2) graph 

11) /1 -> /2 -> /3
    => (3, 2) graph




