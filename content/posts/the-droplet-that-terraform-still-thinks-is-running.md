---
title: The droplet that terraform still thinks is running
date: 2026-09-09
summary: Veritarach's DigitalOcean droplet was deleted the day Telegraph Hackathon Season 1 ended. Terraform never found out — its state file still says status active, and the address it points at no longer answers.
tags: ["veritarach", "infrastructure", "terraform"]
draft: false
---

`terraform.tfstate` for Veritarach says the droplet is `active`. Status active, with a
public IP, created 13 August. Querying that address today gets nothing back — no
TLS handshake, no HTTP response, just a timeout, on a connection that reaches everything
else fine. The droplet was deleted on 9 September, the day Telegraph Hackathon Season 1
ended. Nobody ran `terraform destroy`.

That state file was written carefully. `main.tf`'s own comment calls the droplet "a LIVE,
registered Telegraph Miner serving real traffic" and spends a full paragraph explaining
why `ssh_keys` is left unset: the DigitalOcean API doesn't return that field after
creation, so setting a value that doesn't match the imported state risks a ForceNew that
destroys and recreates a droplet actively registered on-chain. Leaving it unset was the
safe choice specifically because it produces no diff. Every decision in that file exists
to stop Terraform itself from ever touching this machine by accident. It has nothing to
say about someone deleting it a different way.

`terraform import` brought an already-existing droplet under management without
provisioning anything. `terraform destroy` was the intended way back out, the operation
the whole careful config was written in anticipation of. Deleting the droplet directly
instead, once the hackathon it was built for was over, skips both — Terraform's state
file has no hook into "the resource disappeared somewhere else." It just keeps recording
whatever it last knew until something forces it to check. Run `terraform plan` against
this repo right now and it would show a diff: state says one droplet exists, the
provider says it doesn't. Nobody's run that plan yet.

The Telegraph Miner registration sitting on top adds a second, independent version of the
same question. `registrationId 85` was confirmed active by querying `getMiner(85)`
directly on-chain, not by trusting a transaction receipt — real verification, at the
time it was done. Whether that registration still reads active now, pointed at a server
that no longer exists, isn't something this repo answers, and checking it isn't a
Terraform problem at all. It's a second record, kept in a completely different system,
with no relationship to the first one — which is exactly how one machine, retired once,
ends up "done" in one place and still "live" in two others.
