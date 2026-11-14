'use client';

import React from 'react';
import { Toaster } from 'sileo';
import 'sileo/styles.css';

export function SileoToaster() {
  return <Toaster position="top-right" theme="dark" />;
}
