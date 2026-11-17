import { localizedString, localizedText } from './localized';
import { post } from './post';
import { project } from './project';
import { siteSettings } from './siteSettings';
import { siteCopyTypes } from './siteCopy';
import { siteContentTypes } from './siteContent';

export const schemaTypes = [localizedString, localizedText, post, project, siteSettings, ...siteCopyTypes, ...siteContentTypes];
