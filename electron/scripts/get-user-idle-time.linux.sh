#!/bin/sh

w | awk '{if (NR!=1) {print $5 }}'