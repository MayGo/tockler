#!/bin/bash
for i in `seq 1 5`;
  do
	echo $i
	echo `osascript get-foreground-window-title.osa`
	sleep 1
done