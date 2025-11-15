alter table "user" add column "updatedAt" date not null;

alter table "session" add column "updatedAt" date not null;

alter table "account" add column "updatedAt" date not null;

alter table "verification" add column "updatedAt" date not null;